<?php
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get courses for teacher
    if (isset($_GET['instructor_id'])) {
        $teacher_id = $_GET['instructor_id'];
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE teacher_id = ? ORDER BY created_at DESC");
        $stmt->execute([$teacher_id]);
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($courses);
        exit;
    }

    if (isset($_GET['course_id'])) {
        $course_id = $_GET['course_id'];
        
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE course_id = ?");
        $stmt->execute([$course_id]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$course) {
            http_response_code(404);
            echo json_encode(["error" => "Course not found"]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC");
        $stmt->execute([$course_id]);
        $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($modules as &$module) {
            $stmt = $pdo->prepare("SELECT * FROM course_topics WHERE module_id = ? ORDER BY order_index ASC");
            $stmt->execute([$module['module_id']]);
            $topics = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($topics as &$topic) {
                $stmt = $pdo->prepare("SELECT * FROM quizzes WHERE topic_id = ?");
                $stmt->execute([$topic['topic_id']]);
                $quizzes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($quizzes as &$quiz) {
                    $stmt = $pdo->prepare("SELECT * FROM quiz_questions WHERE quiz_id = ?");
                    $stmt->execute([$quiz['quiz_id']]);
                    $quiz['questions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                
                $topic['quizzes'] = $quizzes;
            }

            $module['topics'] = $topics;
        }

        $course['modules'] = $modules;
        echo json_encode($course);
        exit;
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['action']) && $data['action'] === 'create_course') {
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO courses (teacher_id, title, description, difficulty_level, status) VALUES (?, ?, ?, ?, ?) RETURNING course_id");
            $stmt->execute([
                $data['teacher_id'] ?? 1, // default or get from auth
                $data['title'],
                $data['description'] ?? '',
                $data['difficulty_level'] ?? 'Beginner',
                $data['status'] ?? 'Draft'
            ]);
            $course_id = $stmt->fetchColumn();

            if (!empty($data['modules'])) {
                foreach ($data['modules'] as $mIndex => $module) {
                    $stmt = $pdo->prepare("INSERT INTO course_modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?) RETURNING module_id");
                    $stmt->execute([$course_id, $module['title'], $module['description'] ?? '', $mIndex]);
                    $module_id = $stmt->fetchColumn();

                    if (!empty($module['topics'])) {
                        foreach ($module['topics'] as $tIndex => $topic) {
                            $stmt = $pdo->prepare("INSERT INTO course_topics (module_id, title, content, code_example, order_index) VALUES (?, ?, ?, ?, ?) RETURNING topic_id");
                            $stmt->execute([$module_id, $topic['title'], $topic['content'] ?? '', $topic['code_example'] ?? '', $tIndex]);
                            $topic_id = $stmt->fetchColumn();

                            if (!empty($topic['quizzes'])) {
                                foreach ($topic['quizzes'] as $quiz) {
                                    $stmt = $pdo->prepare("INSERT INTO quizzes (course_id, module_id, topic_id, title, description) VALUES (?, ?, ?, ?, ?) RETURNING quiz_id");
                                    $stmt->execute([$course_id, $module_id, $topic_id, $quiz['title'], $quiz['description'] ?? '']);
                                    $quiz_id = $stmt->fetchColumn();

                                    if (!empty($quiz['questions'])) {
                                        foreach ($quiz['questions'] as $q) {
                                            $stmt = $pdo->prepare("INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?)");
                                            $stmt->execute([
                                                $quiz_id,
                                                $q['question_text'],
                                                $q['question_type'] ?? 'multiple_choice',
                                                json_encode($q['options']),
                                                $q['correct_answer'] ?? '',
                                                $q['points'] ?? 1
                                            ]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            $pdo->commit();
            echo json_encode(["status" => "success", "course_id" => $course_id]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        exit;
    }
}
?>
