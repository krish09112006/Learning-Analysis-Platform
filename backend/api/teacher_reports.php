<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
    exit();
}

$instructor_id = isset($_GET['instructor_id']) ? (int)$_GET['instructor_id'] : getAuthenticatedTeacher($pdo);
$type = isset($_GET['type']) ? $_GET['type'] : 'course_progress';
$format = isset($_GET['format']) ? $_GET['format'] : 'json';

try {
    // Find courses by instructor
    $c_stmt = $pdo->prepare("SELECT course_id FROM courses WHERE instructor_id = :iid OR teacher_id = :iid");
    $c_stmt->execute([':iid' => $instructor_id]);
    $courseIds = $c_stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($courseIds)) {
        $c_stmt = $pdo->query("SELECT course_id FROM courses");
        $courseIds = $c_stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    if (empty($courseIds)) {
        if ($format === 'csv') {
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename=teacher_report_' . $type . '.csv');
            echo "No data available";
            exit();
        }
        echo json_encode(["type" => $type, "headers" => [], "data" => []]);
        exit();
    }

    $inClause = implode(',', array_map('intval', $courseIds));
    $reportData = [];
    $csvHeaders = [];

    if ($type === 'course_progress') {
        $csvHeaders = ["Student Name", "Email", "Course", "Completed Topics", "Total Topics", "Progress %", "Study Hours", "Enrolled Date"];
        $stmt = $pdo->query("
            SELECT u.name, u.email, COALESCE(c.course_name, c.title) as course_name,
                   (SELECT COUNT(*) FROM student_progress WHERE student_id = e.student_id AND course_id = e.course_id AND completion_status = TRUE) as completed_topics,
                   (SELECT COUNT(*) FROM topics WHERE course_id = e.course_id) as total_topics,
                   (SELECT COALESCE(ROUND(SUM(time_spent) / 3600.0, 1), 0) FROM student_progress WHERE student_id = e.student_id AND course_id = e.course_id) as study_hours,
                   e.enrolled_at
            FROM enrollments e
            JOIN users u ON e.student_id = u.user_id
            JOIN courses c ON e.course_id = c.course_id
            WHERE e.course_id IN ($inClause)
            ORDER BY c.course_id, u.name
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $r) {
            $tot = (int)$r['total_topics'];
            $comp = (int)$r['completed_topics'];
            $pct = $tot > 0 ? round(($comp / $tot) * 100) : 0;
            $reportData[] = [
                "Student Name" => $r['name'],
                "Email" => $r['email'],
                "Course" => $r['course_name'],
                "Completed Topics" => $comp,
                "Total Topics" => $tot,
                "Progress %" => $pct . "%",
                "Study Hours" => $r['study_hours'] . " hrs",
                "Enrolled Date" => date('Y-m-d', strtotime($r['enrolled_at']))
            ];
        }
    } elseif ($type === 'quiz_performance') {
        $csvHeaders = ["Student Name", "Course", "Quiz Title", "Score", "Percentage", "Time Taken (s)", "Date"];
        $stmt = $pdo->query("
            SELECT u.name, COALESCE(c.course_name, c.title) as course_name, 
                   COALESCE(q.quiz_title, q.title) as quiz_title, qr.score, qr.percentage, qr.time_taken, qr.attempt_date
            FROM quiz_results qr
            JOIN users u ON qr.student_id = u.user_id
            JOIN quizzes q ON qr.quiz_id = q.quiz_id
            JOIN courses c ON q.course_id = c.course_id
            WHERE q.course_id IN ($inClause)
            ORDER BY qr.attempt_date DESC
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $r) {
            $reportData[] = [
                "Student Name" => $r['name'],
                "Course" => $r['course_name'],
                "Quiz Title" => $r['quiz_title'],
                "Score" => $r['score'],
                "Percentage" => $r['percentage'] . "%",
                "Time Taken (s)" => $r['time_taken'] . "s",
                "Date" => date('Y-m-d H:i', strtotime($r['attempt_date']))
            ];
        }
    } elseif ($type === 'assignments') {
        $csvHeaders = ["Student Name", "Course", "Assignment Title", "Status", "Marks Awarded", "Max Marks", "Submitted At"];
        $stmt = $pdo->query("
            SELECT u.name, COALESCE(c.course_name, c.title) as course_name, a.title, s.status, s.marks_awarded, 
                   COALESCE(a.max_marks, a.total_marks, 100) as max_marks, s.submitted_at
            FROM assignment_submissions s
            JOIN users u ON s.student_id = u.user_id
            JOIN assignments a ON s.assignment_id = a.assignment_id
            JOIN courses c ON a.course_id = c.course_id
            WHERE a.course_id IN ($inClause)
            ORDER BY s.submitted_at DESC
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $r) {
            $reportData[] = [
                "Student Name" => $r['name'],
                "Course" => $r['course_name'],
                "Assignment Title" => $r['title'],
                "Status" => $r['status'],
                "Marks Awarded" => $r['marks_awarded'] !== null ? $r['marks_awarded'] : "Ungraded",
                "Max Marks" => $r['max_marks'],
                "Submitted At" => date('Y-m-d H:i', strtotime($r['submitted_at']))
            ];
        }
    }

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=teacher_report_' . $type . '_' . date('Ymd_His') . '.csv');
        $output = fopen('php://output', 'w');
        fputcsv($output, $csvHeaders);
        foreach ($reportData as $row) {
            fputcsv($output, array_values($row));
        }
        fclose($output);
        exit();
    }

    echo json_encode([
        "type" => $type,
        "headers" => $csvHeaders,
        "data" => $reportData
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
