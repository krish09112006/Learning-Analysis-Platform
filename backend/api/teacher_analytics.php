<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$instructor_id = isset($_GET['instructor_id']) ? (int)$_GET['instructor_id'] : getAuthenticatedTeacher($pdo);

try {
    // 1. Total Courses Created by Instructor
    $stmt = $pdo->prepare("SELECT course_id, COALESCE(course_name, title) as course_name FROM courses WHERE instructor_id = :iid OR teacher_id = :iid");
    $stmt->execute([':iid' => $instructor_id]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If teacher has no courses assigned specifically, include all courses for preview/faculty overview
    if (empty($courses)) {
        $stmt = $pdo->query("SELECT course_id, COALESCE(course_name, title) as course_name FROM courses ORDER BY course_id ASC");
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $totalCourses = count($courses);
    $courseIds = array_map(function($c) { return (int)$c['course_id']; }, $courses);

    if (empty($courseIds)) {
        echo json_encode([
            "totalCourses" => 0,
            "totalStudents" => 0,
            "totalQuizzes" => 0,
            "totalAssignments" => 0,
            "avgQuizPerformance" => 0,
            "completionStats" => ["completed" => 0, "inProgress" => 0, "notStarted" => 0, "total" => 0],
            "pendingAssignments" => 0,
            "recentActivity" => [],
            "charts" => [
                "enrollment" => [],
                "performance" => ["needsHelp" => 0, "moderate" => 0, "strong" => 0],
                "topicCompletion" => [],
                "quizResults" => []
            ],
            "courses" => []
        ]);
        exit();
    }

    $inClause = implode(',', $courseIds);

    // 2. Distinct Enrolled Students
    $stmt = $pdo->query("SELECT COUNT(DISTINCT student_id) as total FROM enrollments WHERE course_id IN ($inClause)");
    $totalStudents = (int)$stmt->fetchColumn();

    // 3. Total Quizzes
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM quizzes WHERE course_id IN ($inClause)");
    $totalQuizzes = (int)$stmt->fetchColumn();

    // 4. Total Assignments
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM assignments WHERE course_id IN ($inClause)");
    $totalAssignments = (int)$stmt->fetchColumn();

    // 5. Average Quiz Performance
    $stmt = $pdo->query("
        SELECT COALESCE(ROUND(AVG(qr.percentage), 1), 0) as avg_score 
        FROM quiz_results qr
        JOIN quizzes q ON qr.quiz_id = q.quiz_id
        WHERE q.course_id IN ($inClause)
    ");
    $avgQuizPerformance = (float)$stmt->fetchColumn();

    // 6. Course Completion Statistics
    $stmt = $pdo->query("
        SELECT e.student_id, e.course_id,
               (SELECT COUNT(*) FROM topics WHERE course_id = e.course_id) as total_topics,
               (SELECT COUNT(*) FROM student_progress WHERE student_id = e.student_id AND course_id = e.course_id AND completion_status = TRUE) as completed_topics
        FROM enrollments e
        WHERE e.course_id IN ($inClause)
    ");
    $enrollmentProgress = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $completedCount = 0;
    $inProgressCount = 0;
    $notStartedCount = 0;

    foreach ($enrollmentProgress as $ep) {
        $tot = (int)$ep['total_topics'];
        $comp = (int)$ep['completed_topics'];
        if ($tot > 0 && $comp >= $tot) {
            $completedCount++;
        } elseif ($comp > 0) {
            $inProgressCount++;
        } else {
            $notStartedCount++;
        }
    }

    // 7. Pending Assignments Needing Review
    $stmt = $pdo->query("
        SELECT COUNT(*) as total 
        FROM assignment_submissions s
        JOIN assignments a ON s.assignment_id = a.assignment_id
        WHERE a.course_id IN ($inClause) AND (s.status = 'Submitted' OR s.status = 'Pending Evaluation')
    ");
    $pendingAssignments = (int)$stmt->fetchColumn();

    // 8. Recent Activity (from timeline events or fallback from submissions/quiz results)
    $stmt = $pdo->query("
        SELECT e.event_id, e.student_id, e.course_id, e.event_type, e.event_title, 
               e.event_description, e.created_at, u.name as student_name, u.avatar as student_avatar,
               COALESCE(c.course_name, c.title) as course_name
        FROM learning_timeline_events e
        JOIN users u ON e.student_id = u.user_id
        JOIN courses c ON e.course_id = c.course_id
        WHERE e.course_id IN ($inClause)
        ORDER BY e.created_at DESC
        LIMIT 10
    ");
    $recentActivity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($recentActivity)) {
        // Fallback recent activity from quiz results or submissions
        $fallbackStmt = $pdo->query("
            SELECT qr.result_id as event_id, qr.student_id, q.course_id, 'quiz_attempt' as event_type,
                   'Quiz Completed' as event_title,
                   CONCAT('Scored ', qr.percentage, '% in ', COALESCE(q.quiz_title, q.title)) as event_description,
                   qr.attempt_date as created_at, u.name as student_name, u.avatar as student_avatar,
                   COALESCE(c.course_name, c.title) as course_name
            FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.quiz_id
            JOIN users u ON qr.student_id = u.user_id
            JOIN courses c ON q.course_id = c.course_id
            WHERE q.course_id IN ($inClause)
            ORDER BY qr.attempt_date DESC
            LIMIT 5
        ");
        $recentActivity = $fallbackStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 9. Charts Data
    // Chart A: Enrollment per Course
    $stmt = $pdo->query("
        SELECT COALESCE(c.course_name, c.title) as course_name, COUNT(e.enrollment_id) as student_count
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        WHERE c.course_id IN ($inClause)
        GROUP BY c.course_id, c.course_name, c.title
        ORDER BY student_count DESC
    ");
    $enrollmentChart = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Chart B: Performance Distribution
    $stmt = $pdo->query("
        SELECT 
            COALESCE(SUM(CASE WHEN qr.percentage < 50 THEN 1 ELSE 0 END), 0) as low_count,
            COALESCE(SUM(CASE WHEN qr.percentage >= 50 AND qr.percentage < 75 THEN 1 ELSE 0 END), 0) as mid_count,
            COALESCE(SUM(CASE WHEN qr.percentage >= 75 THEN 1 ELSE 0 END), 0) as high_count
        FROM quiz_results qr
        JOIN quizzes q ON qr.quiz_id = q.quiz_id
        WHERE q.course_id IN ($inClause)
    ");
    $perfDist = $stmt->fetch(PDO::FETCH_ASSOC);

    // Chart C: Topic Completion Rates
    $stmt = $pdo->query("
        SELECT COALESCE(t.topic_name, t.title) as topic_name, 
               COUNT(DISTINCT sp.student_id) as completed_students,
               (SELECT COUNT(DISTINCT student_id) FROM enrollments WHERE course_id = t.course_id) as total_enrolled
        FROM topics t
        LEFT JOIN student_progress sp ON t.topic_id = sp.topic_id AND sp.completion_status = TRUE
        WHERE t.course_id IN ($inClause)
        GROUP BY t.topic_id, t.topic_name, t.title, t.course_id
        ORDER BY t.course_id ASC, t.topic_id ASC
        LIMIT 8
    ");
    $topicCompletionChart = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Chart D: Quiz Results average by Quiz Title
    $stmt = $pdo->query("
        SELECT COALESCE(q.quiz_title, q.title) as quiz_title, 
               COALESCE(ROUND(AVG(qr.percentage), 1), 0) as avg_percentage,
               COUNT(qr.result_id) as total_attempts
        FROM quizzes q
        LEFT JOIN quiz_results qr ON q.quiz_id = qr.quiz_id
        WHERE q.course_id IN ($inClause)
        GROUP BY q.quiz_id, q.quiz_title, q.title
        LIMIT 6
    ");
    $quizResultsChart = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        "totalCourses" => $totalCourses,
        "totalStudents" => $totalStudents,
        "totalQuizzes" => $totalQuizzes,
        "totalAssignments" => $totalAssignments,
        "avgQuizPerformance" => $avgQuizPerformance,
        "completionStats" => [
            "completed" => $completedCount,
            "inProgress" => $inProgressCount,
            "notStarted" => $notStartedCount,
            "total" => count($enrollmentProgress) ?: 1
        ],
        "pendingAssignments" => $pendingAssignments,
        "recentActivity" => $recentActivity,
        "charts" => [
            "enrollment" => $enrollmentChart,
            "performance" => [
                "needsHelp" => (int)($perfDist['low_count'] ?? 0),
                "moderate" => (int)($perfDist['mid_count'] ?? 0),
                "strong" => (int)($perfDist['high_count'] ?? 0)
            ],
            "topicCompletion" => $topicCompletionChart,
            "quizResults" => $quizResultsChart
        ],
        "courses" => $courses
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
