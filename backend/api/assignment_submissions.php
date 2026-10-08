<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
    case 'GET':
        $assignment_id = isset($_GET['assignment_id']) ? (int)$_GET['assignment_id'] : null;
        $student_id = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;
        $submission_id = isset($_GET['submission_id']) ? (int)$_GET['submission_id'] : null;

        $sql = "
            SELECT s.*, 
                   u.name as student_name, u.email as student_email, u.avatar as student_avatar,
                   a.title as assignment_title, COALESCE(a.max_marks, a.total_marks, 100) as max_marks,
                   COALESCE(c.course_name, c.title) as course_name
            FROM assignment_submissions s
            JOIN users u ON s.student_id = u.user_id
            JOIN assignments a ON s.assignment_id = a.assignment_id
            JOIN courses c ON a.course_id = c.course_id
            WHERE 1=1
        ";
        $params = [];

        if ($submission_id) {
            $sql .= " AND s.submission_id = ?";
            $params[] = $submission_id;
        }
        if ($assignment_id) {
            $sql .= " AND s.assignment_id = ?";
            $params[] = $assignment_id;
        }
        if ($student_id) {
            $sql .= " AND s.student_id = ?";
            $params[] = $student_id;
        }

        $sql .= " ORDER BY s.submitted_at DESC";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $subs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($subs as &$sub) {
                $sub['id'] = $sub['submission_id'];
                if (!$sub['student_avatar']) {
                    $sub['student_avatar'] = "https://ui-avatars.com/api/?name=" . urlencode($sub['student_name']) . "&background=random";
                }
            }

            echo json_encode($subs);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $aid = (int)($data['assignment_id'] ?? 0);
        $sid = (int)($data['student_id'] ?? 0);

        if (!$aid || !$sid) {
            http_response_code(400);
            echo json_encode(["error" => "Assignment ID and Student ID are required."]);
            exit();
        }

        $file_name = trim($data['file_name'] ?? 'submission.pdf');
        $file_url = trim($data['file_url'] ?? '#');
        $sub_text = trim($data['submission_text'] ?? '');
        $status = 'Submitted';

        try {
            $stmt = $pdo->prepare("
                INSERT INTO assignment_submissions 
                (assignment_id, student_id, file_name, file_url, submission_text, status, submitted_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                RETURNING submission_id
            ");
            $stmt->execute([$aid, $sid, $file_name, $file_url, $sub_text, $status]);
            $newId = (int)$stmt->fetchColumn();

            echo json_encode(["status" => "success", "message" => "Assignment submitted successfully.", "submission_id" => $newId, "id" => $newId]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $subId = (int)($data['submission_id'] ?? $data['id'] ?? 0);

        if (!$subId) {
            http_response_code(400);
            echo json_encode(["error" => "Submission ID is required."]);
            exit();
        }

        $marks = isset($data['marks_awarded']) ? (int)$data['marks_awarded'] : null;
        $feedback = trim($data['feedback'] ?? '');
        $status = trim($data['status'] ?? ($marks !== null ? 'Evaluated' : 'Pending Evaluation'));

        try {
            $stmt = $pdo->prepare("
                UPDATE assignment_submissions
                SET marks_awarded = ?, feedback = ?, status = ?, graded_at = CURRENT_TIMESTAMP
                WHERE submission_id = ?
            ");
            $stmt->execute([$marks, $feedback, $status, $subId]);

            // Also record in assignment_evaluations table
            try {
                $teacherId = getAuthenticatedTeacher($pdo);
                $evalStmt = $pdo->prepare("
                    INSERT INTO assignment_evaluations 
                    (submission_id, evaluator_id, marks_awarded, feedback, evaluation_status, evaluated_at)
                    VALUES (?, ?, ?, ?, 'Published', CURRENT_TIMESTAMP)
                ");
                $evalStmt->execute([$subId, $teacherId, $marks, $feedback]);
            } catch (Exception $ee) {}

            echo json_encode(["status" => "success", "message" => "Submission graded successfully."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed."]);
        break;
}
?>
