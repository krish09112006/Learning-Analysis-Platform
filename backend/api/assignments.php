<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
    case 'GET':
        $assignment_id = isset($_GET['assignment_id']) ? (int)$_GET['assignment_id'] : null;
        $course_id = isset($_GET['course_id']) ? mapCourseIdToDb($_GET['course_id']) : null;
        $topic_id = isset($_GET['topic_id']) ? (int)$_GET['topic_id'] : null;
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        // Action: Duplicate
        if ($action === 'duplicate' && $assignment_id) {
            $stmt = $pdo->prepare("SELECT * FROM assignments WHERE assignment_id = ?");
            $stmt->execute([$assignment_id]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$existing) {
                http_response_code(404);
                echo json_encode(["error" => "Assignment not found."]);
                exit();
            }

            $newTitle = $existing['title'] . ' (Copy)';
            $insStmt = $pdo->prepare("
                INSERT INTO assignments 
                (course_id, topic_id, module_id, title, assignment_code, category, difficulty,
                 description, instructions, passing_marks, max_marks, total_marks,
                 start_at, due_at, due_date, late_deadline, submission_type, allowed_file_types,
                 max_file_size, max_files, max_attempts, allow_resubmission, accept_late_submissions,
                 late_policy, grading_method, feedback_required, grade_release_mode, status, reference_file)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?)
                RETURNING assignment_id
            ");
            $insStmt->execute([
                $existing['course_id'], $existing['topic_id'], $existing['module_id'] ?? null,
                $newTitle, ($existing['assignment_code'] ?? 'ASSIGN') . '-COPY',
                $existing['category'] ?? 'Lab', $existing['difficulty'] ?? 'Intermediate',
                $existing['description'] ?? '', $existing['instructions'] ?? '',
                $existing['passing_marks'] ?? 50, $existing['max_marks'] ?? 100, $existing['total_marks'] ?? 100,
                $existing['start_at'] ?? null, $existing['due_at'] ?? null, $existing['due_date'] ?? null,
                $existing['late_deadline'] ?? null, $existing['submission_type'] ?? 'File Upload',
                $existing['allowed_file_types'] ?? '.pdf,.doc,.docx,.zip',
                $existing['max_file_size'] ?? 10485760, $existing['max_files'] ?? 1, $existing['max_attempts'] ?? 1,
                $existing['allow_resubmission'] ?? false, $existing['accept_late_submissions'] ?? false,
                $existing['late_policy'] ?? '', $existing['grading_method'] ?? 'Manual Grading',
                $existing['feedback_required'] ?? false, $existing['grade_release_mode'] ?? 'Release after each evaluation',
                $existing['reference_file'] ?? null
            ]);
            $newId = (int)$insStmt->fetchColumn();

            echo json_encode(["message" => "Assignment duplicated.", "assignment_id" => $newId, "id" => $newId]);
            exit();
        }

        // Action: Close
        if ($action === 'close' && $assignment_id) {
            $stmt = $pdo->prepare("UPDATE assignments SET status = 'Closed', updated_at = CURRENT_TIMESTAMP WHERE assignment_id = ?");
            $stmt->execute([$assignment_id]);
            echo json_encode(["message" => "Assignment closed successfully."]);
            exit();
        }

        // Single assignment
        if ($assignment_id) {
            $stmt = $pdo->prepare("
                SELECT a.*, COALESCE(c.course_name, c.title) as course_name, 
                       COALESCE(t.topic_name, t.title) as topic_name,
                       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.assignment_id) as total_submissions,
                       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.assignment_id AND status = 'Submitted') as pending_submissions,
                       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.assignment_id AND (status = 'Evaluated' OR status = 'Graded')) as evaluated_submissions,
                       (SELECT COALESCE(ROUND(AVG(marks_awarded), 1), 0) FROM assignment_submissions WHERE assignment_id = a.assignment_id AND marks_awarded IS NOT NULL) as average_score
                FROM assignments a
                LEFT JOIN courses c ON a.course_id = c.course_id
                LEFT JOIN topics t ON a.topic_id = t.topic_id
                WHERE a.assignment_id = ?
            ");
            $stmt->execute([$assignment_id]);
            $assn = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($assn) {
                $assn['id'] = $assn['assignment_id'];
                $assn['submission_count'] = (int)$assn['total_submissions'];
                echo json_encode($assn);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Assignment not found."]);
            }
            exit();
        }

        // List assignments
        $sql = "
            SELECT a.*, COALESCE(c.course_name, c.title) as course_name, 
                   COALESCE(t.topic_name, t.title) as topic_name,
                   (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.assignment_id) as total_submissions,
                   (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.assignment_id AND status = 'Submitted') as pending_submissions,
                   (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.assignment_id AND (status = 'Evaluated' OR status = 'Graded')) as evaluated_submissions,
                   (SELECT COALESCE(ROUND(AVG(marks_awarded), 1), 0) FROM assignment_submissions WHERE assignment_id = a.assignment_id AND marks_awarded IS NOT NULL) as average_score
            FROM assignments a
            LEFT JOIN courses c ON a.course_id = c.course_id
            LEFT JOIN topics t ON a.topic_id = t.topic_id
            WHERE 1=1
        ";
        $params = [];
        if ($course_id) {
            $sql .= " AND a.course_id = ?";
            $params[] = $course_id;
        }
        if ($topic_id) {
            $sql .= " AND a.topic_id = ?";
            $params[] = $topic_id;
        }
        $sql .= " ORDER BY a.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $list = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($list as &$item) {
            $item['id'] = $item['assignment_id'];
            $item['submission_count'] = (int)$item['total_submissions'];
            $item['max_marks'] = (int)($item['max_marks'] ?? $item['total_marks'] ?? 100);
            $item['passing_marks'] = (int)($item['passing_marks'] ?? 50);
        }

        echo json_encode($list);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];

        $course_id = mapCourseIdToDb($data['course_id'] ?? null);
        $topic_id = isset($data['topic_id']) && $data['topic_id'] ? (int)$data['topic_id'] : null;
        $module_id = isset($data['module_id']) && $data['module_id'] ? (int)$data['module_id'] : null;
        $title = trim($data['title'] ?? 'Untitled Assignment');
        $assignment_code = trim($data['assignment_code'] ?? ('ASN-' . strtoupper(substr(uniqid(), -4))));
        $category = trim($data['category'] ?? 'Lab');
        $difficulty = trim($data['difficulty'] ?? 'Intermediate');
        $description = trim($data['description'] ?? '');
        $instructions = trim($data['instructions'] ?? '');
        $passing_marks = (int)($data['passing_marks'] ?? 50);
        $max_marks = (int)($data['max_marks'] ?? $data['maximum_marks'] ?? $data['total_marks'] ?? 100);
        $start_at = !empty($data['start_at']) ? $data['start_at'] : null;
        $due_at = !empty($data['due_at']) ? $data['due_at'] : (!empty($data['due_date']) ? $data['due_date'] : null);
        $late_deadline = !empty($data['late_deadline']) ? $data['late_deadline'] : null;
        $submission_type = trim($data['submission_type'] ?? 'File Upload');
        $allowed_file_types = trim($data['allowed_file_types'] ?? '.pdf,.doc,.docx,.zip,.py,.js');
        $max_file_size = (int)($data['max_file_size'] ?? 10485760);
        $max_files = (int)($data['max_files'] ?? 1);
        $max_attempts = (int)($data['max_attempts'] ?? 1);
        $allow_resubmission = !empty($data['allow_resubmission']) ? true : false;
        $accept_late_submissions = !empty($data['accept_late_submissions']) ? true : false;
        $late_policy = trim($data['late_policy'] ?? '');
        $grading_method = trim($data['grading_method'] ?? 'Manual Grading');
        $feedback_required = !empty($data['feedback_required']) ? true : false;
        $grade_release_mode = trim($data['grade_release_mode'] ?? 'Release after each evaluation');
        $status = trim($data['status'] ?? 'Draft');
        $ref_file = trim($data['attachment'] ?? $data['reference_file'] ?? '');

        try {
            $stmt = $pdo->prepare("
                INSERT INTO assignments 
                (course_id, topic_id, module_id, title, assignment_code, category, difficulty,
                 description, instructions, passing_marks, max_marks, total_marks,
                 start_at, due_at, due_date, late_deadline, submission_type, allowed_file_types,
                 max_file_size, max_files, max_attempts, allow_resubmission, accept_late_submissions,
                 late_policy, grading_method, feedback_required, grade_release_mode, status, reference_file)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING assignment_id
            ");
            $stmt->execute([
                $course_id, $topic_id, $module_id, $title, $assignment_code, $category, $difficulty,
                $description, $instructions, $passing_marks, $max_marks, $max_marks,
                $start_at, $due_at, $due_at ? substr($due_at, 0, 10) : null, $late_deadline,
                $submission_type, $allowed_file_types, $max_file_size, $max_files, $max_attempts,
                $allow_resubmission, $accept_late_submissions, $late_policy, $grading_method,
                $feedback_required, $grade_release_mode, $status, $ref_file
            ]);
            $newId = (int)$stmt->fetchColumn();

            echo json_encode(["status" => "success", "message" => "Assignment created successfully.", "assignment_id" => $newId, "id" => $newId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create assignment: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $aid = (int)($data['assignment_id'] ?? $data['id'] ?? 0);

        if (!$aid) {
            http_response_code(400);
            echo json_encode(["error" => "Assignment ID is required."]);
            exit();
        }

        $course_id = mapCourseIdToDb($data['course_id'] ?? null);
        $topic_id = isset($data['topic_id']) && $data['topic_id'] ? (int)$data['topic_id'] : null;
        $title = trim($data['title'] ?? 'Untitled Assignment');
        $assignment_code = trim($data['assignment_code'] ?? 'ASN-01');
        $category = trim($data['category'] ?? 'Lab');
        $difficulty = trim($data['difficulty'] ?? 'Intermediate');
        $description = trim($data['description'] ?? '');
        $instructions = trim($data['instructions'] ?? '');
        $passing_marks = (int)($data['passing_marks'] ?? 50);
        $max_marks = (int)($data['max_marks'] ?? $data['maximum_marks'] ?? $data['total_marks'] ?? 100);
        $start_at = !empty($data['start_at']) ? $data['start_at'] : null;
        $due_at = !empty($data['due_at']) ? $data['due_at'] : (!empty($data['due_date']) ? $data['due_date'] : null);
        $late_deadline = !empty($data['late_deadline']) ? $data['late_deadline'] : null;
        $submission_type = trim($data['submission_type'] ?? 'File Upload');
        $allowed_file_types = trim($data['allowed_file_types'] ?? '.pdf,.doc,.docx,.zip,.py,.js');
        $max_file_size = (int)($data['max_file_size'] ?? 10485760);
        $max_files = (int)($data['max_files'] ?? 1);
        $max_attempts = (int)($data['max_attempts'] ?? 1);
        $allow_resubmission = !empty($data['allow_resubmission']) ? true : false;
        $accept_late_submissions = !empty($data['accept_late_submissions']) ? true : false;
        $late_policy = trim($data['late_policy'] ?? '');
        $grading_method = trim($data['grading_method'] ?? 'Manual Grading');
        $feedback_required = !empty($data['feedback_required']) ? true : false;
        $grade_release_mode = trim($data['grade_release_mode'] ?? 'Release after each evaluation');
        $status = trim($data['status'] ?? 'Draft');

        try {
            $stmt = $pdo->prepare("
                UPDATE assignments SET
                    course_id = COALESCE(?, course_id),
                    topic_id = ?,
                    title = ?,
                    assignment_code = ?,
                    category = ?,
                    difficulty = ?,
                    description = ?,
                    instructions = ?,
                    passing_marks = ?,
                    max_marks = ?,
                    total_marks = ?,
                    start_at = ?,
                    due_at = ?,
                    due_date = ?,
                    late_deadline = ?,
                    submission_type = ?,
                    allowed_file_types = ?,
                    max_file_size = ?,
                    max_files = ?,
                    max_attempts = ?,
                    allow_resubmission = ?,
                    accept_late_submissions = ?,
                    late_policy = ?,
                    grading_method = ?,
                    feedback_required = ?,
                    grade_release_mode = ?,
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE assignment_id = ?
            ");
            $stmt->execute([
                $course_id, $topic_id, $title, $assignment_code, $category, $difficulty,
                $description, $instructions, $passing_marks, $max_marks, $max_marks,
                $start_at, $due_at, $due_at ? substr($due_at, 0, 10) : null, $late_deadline,
                $submission_type, $allowed_file_types, $max_file_size, $max_files, $max_attempts,
                $allow_resubmission, $accept_late_submissions, $late_policy, $grading_method,
                $feedback_required, $grade_release_mode, $status, $aid
            ]);

            echo json_encode(["status" => "success", "message" => "Assignment updated successfully."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update assignment: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $aid = isset($_GET['assignment_id']) ? (int)$_GET['assignment_id'] : 0;
        if ($aid) {
            $stmt = $pdo->prepare("DELETE FROM assignments WHERE assignment_id = ?");
            $stmt->execute([$aid]);
            echo json_encode(["status" => "success", "message" => "Assignment deleted."]);
            exit();
        }
        http_response_code(400);
        echo json_encode(["error" => "Assignment ID is required."]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed."]);
        break;
}
?>
