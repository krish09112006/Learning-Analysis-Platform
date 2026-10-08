<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function mapBankCourseId($id) {
    return mapCourseIdToDb($id);
}

$teacher_id = getAuthenticatedTeacher($pdo);

switch ($method) {
    case 'GET':
        $course_id = isset($_GET['course_id']) && $_GET['course_id'] !== '' ? mapBankCourseId($_GET['course_id']) : null;
        $topic_id = isset($_GET['topic_id']) && $_GET['topic_id'] !== '' ? (int)$_GET['topic_id'] : null;
        $question_type = isset($_GET['question_type']) && $_GET['question_type'] !== '' ? trim($_GET['question_type']) : null;
        $difficulty = isset($_GET['difficulty']) && $_GET['difficulty'] !== '' ? trim($_GET['difficulty']) : null;
        $search = isset($_GET['search']) && $_GET['search'] !== '' ? trim($_GET['search']) : null;

        try {
            $sql = "
                SELECT qb.*, COALESCE(c.course_name, c.title) as course_name, 
                       COALESCE(t.topic_name, t.title, qb.topic_name, 'General') as resolved_topic_name
                FROM question_bank qb
                LEFT JOIN courses c ON qb.course_id = c.course_id
                LEFT JOIN topics t ON qb.topic_id = t.topic_id
                WHERE 1=1
            ";
            $params = [];

            if ($course_id) {
                $sql .= " AND qb.course_id = :cid";
                $params[':cid'] = $course_id;
            }
            if ($topic_id) {
                $sql .= " AND qb.topic_id = :tid";
                $params[':tid'] = $topic_id;
            }
            if ($question_type && strtolower($question_type) !== 'all') {
                $sql .= " AND qb.question_type = :qtype";
                $params[':qtype'] = $question_type;
            }
            if ($difficulty && strtolower($difficulty) !== 'all') {
                $sql .= " AND qb.difficulty = :diff";
                $params[':diff'] = $difficulty;
            }
            if ($search) {
                $sql .= " AND (qb.question_text ILIKE :search OR qb.explanation ILIKE :search OR qb.topic_name ILIKE :search)";
                $params[':search'] = '%' . $search . '%';
            }

            $sql .= " ORDER BY qb.id DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $result = [];
            foreach ($rows as $r) {
                $opts = [];
                if (!empty($r['options_json'])) {
                    $decoded = json_decode($r['options_json'], true);
                    if (is_array($decoded)) $opts = $decoded;
                }
                $result[] = [
                    'id' => (int)$r['id'],
                    'teacher_id' => (int)($r['teacher_id'] ?? $teacher_id),
                    'course_id' => (int)$r['course_id'],
                    'course_name' => $r['course_name'] ?: 'Python Programming',
                    'topic_id' => $r['topic_id'] ? (int)$r['topic_id'] : null,
                    'topic_name' => $r['resolved_topic_name'],
                    'question_text' => $r['question_text'],
                    'question_type' => $r['question_type'] ?: 'mcq',
                    'difficulty' => $r['difficulty'] ?: 'Beginner',
                    'marks' => (float)$r['marks'],
                    'negative_marks' => (float)($r['negative_marks'] ?? 0),
                    'options' => $opts,
                    'correct_answer' => $r['correct_answer'],
                    'explanation' => $r['explanation'] ?: '',
                    'image_url' => $r['image_url'] ?: '',
                    'usage_count' => (int)($r['usage_count'] ?? 0),
                    'created_at' => $r['created_at'],
                    'updated_at' => $r['updated_at']
                ];
            }

            echo json_encode($result);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to load Question Bank: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];

        // Action: Copy selected questions into a quiz
        if (isset($data['action']) && $data['action'] === 'copy_to_quiz') {
            if (empty($data['quiz_id']) || empty($data['bank_ids']) || !is_array($data['bank_ids'])) {
                http_response_code(400);
                echo json_encode(["error" => "quiz_id and bank_ids array are required."]);
                exit();
            }

            $quiz_id = (int)$data['quiz_id'];
            $bank_ids = array_map('intval', $data['bank_ids']);

            try {
                $pdo->beginTransaction();

                $bankFetch = $pdo->prepare("SELECT * FROM question_bank WHERE id = :bid");
                $insQuestion = $pdo->prepare("
                    INSERT INTO quiz_questions 
                    (quiz_id, course_id, topic_id, question_text, question_type, options, correct_answer, points, difficulty, explanation)
                    VALUES (:qid, :cid, :tid, :qtext, :qtype, :optjson, :ans, :pts, :diff, :exp)
                ");
                $incUsage = $pdo->prepare("UPDATE question_bank SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = :bid");

                $copiedQuestions = [];
                foreach ($bank_ids as $bid) {
                    $bankFetch->execute([':bid' => $bid]);
                    $bItem = $bankFetch->fetch(PDO::FETCH_ASSOC);
                    if (!$bItem) continue;

                    $insQuestion->execute([
                        ':qid' => $quiz_id,
                        ':cid' => $bItem['course_id'],
                        ':tid' => $bItem['topic_id'],
                        ':qtext' => $bItem['question_text'],
                        ':qtype' => $bItem['question_type'],
                        ':optjson' => $bItem['options_json'] ?: '[]',
                        ':ans' => $bItem['correct_answer'],
                        ':pts' => $bItem['marks'],
                        ':diff' => $bItem['difficulty'],
                        ':exp' => $bItem['explanation']
                    ]);

                    $incUsage->execute([':bid' => $bid]);
                    $copiedQuestions[] = $bid;
                }

                $pdo->commit();
                echo json_encode([
                    "message" => count($copiedQuestions) . " question(s) copied from Question Bank into quiz.",
                    "copied_question_ids" => $copiedQuestions
                ]);
                exit();
            } catch (Exception $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                http_response_code(500);
                echo json_encode(["error" => "Failed to copy questions: " . $e->getMessage()]);
                exit();
            }
        }

        // Save new question to Question Bank
        $qText = trim($data['question_text'] ?? $data['question'] ?? '');
        if ($qText === '') {
            http_response_code(400);
            echo json_encode(["error" => "Question text is required."]);
            exit();
        }

        $course_id = mapBankCourseId($data['course_id'] ?? 1);
        $topic_id = !empty($data['topic_id']) ? (int)$data['topic_id'] : null;
        $topic_name = trim($data['topic_name'] ?? 'General');
        $qType = trim($data['question_type'] ?? 'mcq');
        $diff = trim($data['difficulty'] ?? 'Beginner');
        $marks = isset($data['marks']) ? (float)$data['marks'] : 2.0;
        $negMarks = isset($data['negative_marks']) ? (float)$data['negative_marks'] : 0.0;
        $options = isset($data['options']) && is_array($data['options']) ? $data['options'] : [];
        $correct_ans = is_array($data['correct_answer'] ?? null) ? implode(',', $data['correct_answer']) : trim((string)($data['correct_answer'] ?? 'A'));
        $explanation = trim($data['explanation'] ?? '');
        $image_url = trim($data['image_url'] ?? '');

        try {
            $stmt = $pdo->prepare("
                INSERT INTO question_bank 
                (teacher_id, course_id, topic_id, topic_name, question_text, question_type, difficulty, marks, negative_marks, options_json, correct_answer, explanation, image_url, usage_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                RETURNING id
            ");
            $stmt->execute([
                $teacher_id, $course_id, $topic_id, $topic_name, $qText, $qType, $diff,
                $marks, $negMarks, json_encode($options), $correct_ans, $explanation, $image_url
            ]);
            $newId = (int)$stmt->fetchColumn();

            http_response_code(201);
            echo json_encode([
                "message" => "Question saved to Topic-Based Question Bank.",
                "id" => $newId
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to save to Question Bank: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        $id = (int)($data['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Question Bank ID is required."]);
            exit();
        }

        $qText = trim($data['question_text'] ?? $data['question'] ?? '');
        $course_id = mapBankCourseId($data['course_id'] ?? 1);
        $topic_id = !empty($data['topic_id']) ? (int)$data['topic_id'] : null;
        $topic_name = trim($data['topic_name'] ?? 'General');
        $qType = trim($data['question_type'] ?? 'mcq');
        $diff = trim($data['difficulty'] ?? 'Beginner');
        $marks = isset($data['marks']) ? (float)$data['marks'] : 2.0;
        $negMarks = isset($data['negative_marks']) ? (float)$data['negative_marks'] : 0.0;
        $options = isset($data['options']) && is_array($data['options']) ? $data['options'] : [];
        $correct_ans = is_array($data['correct_answer'] ?? null) ? implode(',', $data['correct_answer']) : trim((string)($data['correct_answer'] ?? 'A'));
        $explanation = trim($data['explanation'] ?? '');
        $image_url = trim($data['image_url'] ?? '');

        try {
            $stmt = $pdo->prepare("
                UPDATE question_bank SET
                    course_id = ?, topic_id = ?, topic_name = ?, question_text = ?,
                    question_type = ?, difficulty = ?, marks = ?, negative_marks = ?,
                    options_json = ?, correct_answer = ?, explanation = ?, image_url = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([
                $course_id, $topic_id, $topic_name, $qText,
                $qType, $diff, $marks, $negMarks,
                json_encode($options), $correct_ans, $explanation, $image_url,
                $id
            ]);

            echo json_encode(["message" => "Question Bank item updated."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update Question Bank item: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Valid Question Bank ID is required."]);
            exit();
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM question_bank WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Question deleted from Question Bank."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete Question Bank item: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed."]);
        break;
}
?>
