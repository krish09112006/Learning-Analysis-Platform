<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
    case 'GET':
        $instructor_id = isset($_GET['instructor_id']) ? (int)$_GET['instructor_id'] : getAuthenticatedTeacher($pdo);

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
                echo json_encode(["interventions" => [], "automatedFlags" => []]);
                exit();
            }

            $inClause = implode(',', array_map('intval', $courseIds));

            // 1. Fetch saved manual interventions
            $stmt = $pdo->query("
                SELECT i.intervention_id as id, i.intervention_id, i.teacher_id, i.student_id, i.course_id, i.topic_id,
                       i.reason, i.trigger_metric, i.recommended_action, i.teacher_notes, i.status,
                       i.created_at, i.resolved_at,
                       u.name as student_name, u.email as student_email, u.avatar as student_avatar,
                       COALESCE(c.course_name, c.title) as course_name, 
                       COALESCE(t.topic_name, t.title) as topic_name
                FROM teacher_interventions i
                JOIN users u ON i.student_id = u.user_id
                JOIN courses c ON i.course_id = c.course_id
                LEFT JOIN topics t ON i.topic_id = t.topic_id
                WHERE i.course_id IN ($inClause)
                ORDER BY i.created_at DESC
            ");
            $savedInterventions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 2. Compute live automated rule-based flags
            // Rule A: Low Quiz Score (< 50%)
            $ruleA_stmt = $pdo->query("
                SELECT qr.student_id, q.course_id, q.topic_id, qr.percentage,
                       u.name as student_name, u.email as student_email, u.avatar as student_avatar,
                       COALESCE(c.course_name, c.title) as course_name, 
                       COALESCE(t.topic_name, t.title, 'General Assessment') as topic_name, 
                       COALESCE(q.quiz_title, q.title) as quiz_title
                FROM quiz_results qr
                JOIN quizzes q ON qr.quiz_id = q.quiz_id
                LEFT JOIN topics t ON q.topic_id = t.topic_id
                JOIN courses c ON q.course_id = c.course_id
                JOIN users u ON qr.student_id = u.user_id
                WHERE q.course_id IN ($inClause) AND qr.percentage < 50.0
                ORDER BY qr.attempt_date DESC
            ");
            $ruleARows = $ruleA_stmt->fetchAll(PDO::FETCH_ASSOC);

            $automatedFlags = [];
            foreach ($ruleARows as $row) {
                $avatar = $row['student_avatar'] ?: "https://ui-avatars.com/api/?name=" . urlencode($row['student_name']) . "&background=f43f5e&color=fff";
                $automatedFlags[] = [
                    "studentId" => (int)$row['student_id'],
                    "studentName" => $row['student_name'],
                    "studentEmail" => $row['student_email'],
                    "studentAvatar" => $avatar,
                    "courseId" => (int)$row['course_id'],
                    "courseName" => $row['course_name'],
                    "topicId" => (int)($row['topic_id'] ?? 0),
                    "topicName" => $row['topic_name'],
                    "reason" => "Average topic score below 50%",
                    "triggerMetric" => "Scored " . $row['percentage'] . "% on " . $row['quiz_title'],
                    "recommendedAction" => "Assign targeted revision reading and provide supplementary exercise.",
                    "status" => "Flagged"
                ];
            }

            // Rule B: Low progress (< 25%) after older enrollment
            $ruleB_stmt = $pdo->query("
                SELECT e.student_id, e.course_id, e.enrolled_at,
                       u.name as student_name, u.email as student_email, u.avatar as student_avatar,
                       COALESCE(c.course_name, c.title) as course_name,
                       (SELECT COUNT(*) FROM topics WHERE course_id = e.course_id) as total_topics,
                       (SELECT COUNT(*) FROM student_progress WHERE student_id = e.student_id AND course_id = e.course_id AND completion_status = TRUE) as completed_topics
                FROM enrollments e
                JOIN users u ON e.student_id = u.user_id
                JOIN courses c ON e.course_id = c.course_id
                WHERE e.course_id IN ($inClause)
                  AND e.enrolled_at < (CURRENT_DATE - INTERVAL '7 days')
            ");
            $ruleBRows = $ruleB_stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($ruleBRows as $row) {
                $tot = (int)$row['total_topics'];
                $comp = (int)$row['completed_topics'];
                $pct = $tot > 0 ? round(($comp / $tot) * 100) : 0;
                if ($pct < 25) {
                    $avatar = $row['student_avatar'] ?: "https://ui-avatars.com/api/?name=" . urlencode($row['student_name']) . "&background=f59e0b&color=fff";
                    $automatedFlags[] = [
                        "studentId" => (int)$row['student_id'],
                        "studentName" => $row['student_name'],
                        "studentEmail" => $row['student_email'],
                        "studentAvatar" => $avatar,
                        "courseId" => (int)$row['course_id'],
                        "courseName" => $row['course_name'],
                        "topicId" => 0,
                        "topicName" => "Overall Curriculum",
                        "reason" => "Low curriculum progress after 7+ days",
                        "triggerMetric" => "Completed " . $comp . " of " . $tot . " topics (" . $pct . "%)",
                        "recommendedAction" => "Schedule check-in consultation to review learning barriers.",
                        "status" => "Flagged"
                    ];
                }
            }

            echo json_encode([
                "interventions" => $savedInterventions,
                "automatedFlags" => $automatedFlags
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        if (!isset($data['student_id']) || !isset($data['course_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Student ID and Course ID are required."]);
            exit();
        }

        $teacher_id = isset($data['teacher_id']) ? (int)$data['teacher_id'] : getAuthenticatedTeacher($pdo);
        $student_id = (int)$data['student_id'];
        $course_id = (int)$data['course_id'];
        $topic_id = isset($data['topic_id']) && $data['topic_id'] ? (int)$data['topic_id'] : null;
        $reason = trim($data['reason'] ?? 'Instructor manual intervention');
        $trigger_metric = trim($data['trigger_metric'] ?? 'Faculty observation');
        $recommended_action = trim($data['recommended_action'] ?? 'Academic follow-up');
        $teacher_notes = trim($data['teacher_notes'] ?? '');
        $status = trim($data['status'] ?? 'In Progress');

        try {
            $stmt = $pdo->prepare("
                INSERT INTO teacher_interventions 
                (teacher_id, student_id, course_id, topic_id, reason, trigger_metric, recommended_action, teacher_notes, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING intervention_id
            ");
            $stmt->execute([$teacher_id, $student_id, $course_id, $topic_id, $reason, $trigger_metric, $recommended_action, $teacher_notes, $status]);
            $new_id = (int)$stmt->fetchColumn();

            echo json_encode([
                "message" => "Intervention created successfully.",
                "intervention_id" => $new_id,
                "id" => $new_id
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $intervention_id = $data['intervention_id'] ?? $data['id'] ?? null;

        if (!$intervention_id) {
            http_response_code(400);
            echo json_encode(["error" => "Intervention ID is required."]);
            exit();
        }

        $status = trim($data['status'] ?? 'In Progress');
        $teacher_notes = isset($data['teacher_notes']) ? trim($data['teacher_notes']) : '';

        try {
            $stmt = $pdo->prepare("
                UPDATE teacher_interventions
                SET status = ?,
                    teacher_notes = CASE WHEN ? != '' THEN ? ELSE teacher_notes END,
                    resolved_at = CASE WHEN ? = 'Resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
                WHERE intervention_id = ?
            ");
            $stmt->execute([$status, $teacher_notes, $teacher_notes, $status, (int)$intervention_id]);

            echo json_encode(["message" => "Intervention updated successfully."]);
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
