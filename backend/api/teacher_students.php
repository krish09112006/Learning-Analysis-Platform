<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
    exit();
}

$instructor_id = isset($_GET['instructor_id']) ? (int)$_GET['instructor_id'] : getAuthenticatedTeacher($pdo);
$course_filter = isset($_GET['course_id']) && !empty($_GET['course_id']) ? mapCourseIdToDb($_GET['course_id']) : null;
$search = isset($_GET['search']) ? trim($_GET['search']) : null;

try {
    // Find all courses by instructor (or all courses if none specifically mapped)
    $c_stmt = $pdo->prepare("SELECT course_id FROM courses WHERE instructor_id = :iid OR teacher_id = :iid");
    $c_stmt->execute([':iid' => $instructor_id]);
    $courseIds = $c_stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($courseIds)) {
        $c_stmt = $pdo->query("SELECT course_id FROM courses");
        $courseIds = $c_stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    if (empty($courseIds)) {
        echo json_encode([]);
        exit();
    }

    $inClause = implode(',', array_map('intval', $courseIds));

    $query = "
        SELECT e.enrollment_id, e.student_id, e.course_id, e.enrolled_at,
               u.name as student_name, u.email as student_email, u.avatar as student_avatar,
               COALESCE(c.course_name, c.title) as course_name,
               (SELECT COUNT(*) FROM topics WHERE course_id = e.course_id) as total_topics,
               (SELECT COUNT(*) FROM student_progress WHERE student_id = e.student_id AND course_id = e.course_id AND completion_status = TRUE) as completed_topics,
               (SELECT COALESCE(SUM(time_spent), 0) FROM student_progress WHERE student_id = e.student_id AND course_id = e.course_id) as total_study_seconds,
               (SELECT MAX(last_accessed) FROM student_progress WHERE student_id = e.student_id AND course_id = e.course_id) as last_activity
        FROM enrollments e
        JOIN users u ON e.student_id = u.user_id
        JOIN courses c ON e.course_id = c.course_id
        WHERE e.course_id IN ($inClause)
    ";
    $params = [];

    if ($course_filter) {
        $query .= " AND e.course_id = :cid";
        $params[':cid'] = $course_filter;
    }

    if ($search) {
        $query .= " AND (u.name ILIKE :search OR u.email ILIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $query .= " ORDER BY e.enrolled_at DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($rows as $row) {
        $sid = (int)$row['student_id'];
        $cid = (int)$row['course_id'];
        $total_t = (int)$row['total_topics'];
        $comp_t = (int)$row['completed_topics'];
        $progress_pct = $total_t > 0 ? (int)round(($comp_t / $total_t) * 100) : 0;

        // Quiz scores for this student in this course
        $q_stmt = $pdo->prepare("
            SELECT qr.score, qr.percentage, COALESCE(q.quiz_title, q.title) as quiz_title, 
                   COALESCE(t.topic_name, t.title) as topic_name, t.topic_id
            FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.quiz_id
            LEFT JOIN topics t ON q.topic_id = t.topic_id
            WHERE qr.student_id = :sid AND q.course_id = :cid
        ");
        $q_stmt->execute([':sid' => $sid, ':cid' => $cid]);
        $quizAttempts = $q_stmt->fetchAll(PDO::FETCH_ASSOC);

        $avgQuizScore = 0;
        $weakTopics = [];
        if (!empty($quizAttempts)) {
            $sum = 0;
            foreach ($quizAttempts as $qa) {
                $pct = (float)$qa['percentage'];
                $sum += $pct;
                if ($pct < 50.0 && $qa['topic_id']) {
                    $weakTopics[] = [
                        "topicId" => $qa['topic_id'],
                        "topicName" => $qa['topic_name'] ?: 'Topic Assessment',
                        "score" => $pct
                    ];
                }
            }
            $avgQuizScore = (int)round($sum / count($quizAttempts));
        }

        // Assignment submissions
        $a_stmt = $pdo->prepare("
            SELECT s.marks_awarded, COALESCE(a.max_marks, a.total_marks, 100) as max_marks, s.status, a.title
            FROM assignment_submissions s
            JOIN assignments a ON s.assignment_id = a.assignment_id
            WHERE s.student_id = :sid AND a.course_id = :cid
        ");
        $a_stmt->execute([':sid' => $sid, ':cid' => $cid]);
        $assnSubs = $a_stmt->fetchAll(PDO::FETCH_ASSOC);

        $gradedCount = 0;
        $totalMarksEarned = 0;
        $totalMaxMarks = 0;
        foreach ($assnSubs as $asub) {
            if ($asub['marks_awarded'] !== null) {
                $gradedCount++;
                $totalMarksEarned += (int)$asub['marks_awarded'];
                $totalMaxMarks += (int)$asub['max_marks'];
            }
        }
        $avgAssnScore = $totalMaxMarks > 0 ? (int)round(($totalMarksEarned / $totalMaxMarks) * 100) : null;

        // Attention Flag logic:
        $needsAttention = false;
        $attentionReasons = [];

        if ($avgQuizScore > 0 && $avgQuizScore < 50) {
            $needsAttention = true;
            $attentionReasons[] = "Average quiz score below 50% (" . $avgQuizScore . "%)";
        }
        if (count($weakTopics) > 0) {
            $needsAttention = true;
            $attentionReasons[] = count($weakTopics) . " weak topic(s) identified";
        }
        if ($progress_pct < 25 && strtotime($row['enrolled_at']) < strtotime('-7 days')) {
            $needsAttention = true;
            $attentionReasons[] = "Low curriculum progress (" . $progress_pct . "%) after 7 days";
        }

        // Study time formatted
        $secs = (int)$row['total_study_seconds'];
        $hours = floor($secs / 3600);
        $mins = floor(($secs % 3600) / 60);
        $studyTimeStr = ($hours > 0 ? $hours . "h " : "") . $mins . "m";

        $avatar = $row['student_avatar'];
        if (!$avatar) {
            $avatar = "https://ui-avatars.com/api/?name=" . urlencode($row['student_name']) . "&background=0284c7&color=fff";
        }

        $result[] = [
            "studentId" => $sid,
            "studentName" => $row['student_name'],
            "studentEmail" => $row['student_email'],
            "studentAvatar" => $avatar,
            "courseId" => $cid,
            "courseName" => $row['course_name'],
            "enrolledAt" => $row['enrolled_at'],
            "progressPercentage" => $progress_pct,
            "completedTopics" => $comp_t,
            "totalTopics" => $total_t,
            "avgQuizScore" => $avgQuizScore > 0 ? $avgQuizScore : "—",
            "quizAttemptsCount" => count($quizAttempts),
            "avgAssignmentScore" => $avgAssnScore !== null ? $avgAssnScore . "%" : "—",
            "submittedAssignmentsCount" => count($assnSubs),
            "totalStudySeconds" => $secs,
            "studyTimeString" => $studyTimeStr,
            "lastActivity" => $row['last_activity'] ? $row['last_activity'] : $row['enrolled_at'],
            "weakTopics" => $weakTopics,
            "needsAttention" => $needsAttention,
            "attentionReasons" => $attentionReasons
        ];
    }

    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
