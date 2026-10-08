<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$teacher_id = getAuthenticatedTeacher($pdo);

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $course_id = mapCourseIdToDb($_GET['id']);
        
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE course_id = ?");
        $stmt->execute([$course_id]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$course) {
            http_response_code(404);
            echo json_encode(["error" => "Course not found"]);
            exit();
        }

        // Learning Objectives / Outcomes
        $outcomes = [];
        try {
            $stmt = $pdo->prepare("SELECT outcome_text FROM course_learning_outcomes WHERE course_id = ? ORDER BY display_order ASC, id ASC");
            $stmt->execute([$course_id]);
            $outcomes = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {}

        if (empty($outcomes) && !empty($course['learning_objectives'])) {
            $decoded = json_decode($course['learning_objectives'], true);
            if (is_array($decoded)) {
                $outcomes = $decoded;
            } else {
                $outcomes = array_values(array_filter(array_map('trim', explode("\n", $course['learning_objectives']))));
            }
        }
        $course['learning_objectives'] = $outcomes;

        // Modules
        $modules = [];
        try {
            $stmt = $pdo->prepare("SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC, module_id ASC");
            $stmt->execute([$course_id]);
            $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {}

        // Fallback: If no course_modules exist yet but topics exist in topics table
        if (empty($modules)) {
            $topStmt = $pdo->prepare("SELECT * FROM topics WHERE course_id = ? ORDER BY topic_order ASC, topic_id ASC");
            $topStmt->execute([$course_id]);
            $flatTopics = $topStmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($flatTopics)) {
                $modTopics = [];
                foreach ($flatTopics as $ft) {
                    $modTopics[] = [
                        'topic_id' => $ft['topic_id'],
                        'id' => $ft['topic_id'],
                        'topic_name' => $ft['topic_name'],
                        'title' => $ft['topic_name'],
                        'description' => $ft['description'] ?? '',
                        'content' => $ft['content'] ?? '',
                        'examples' => '',
                        'important_concepts' => $ft['category'] ?? '',
                        'duration' => '45 mins',
                        'difficulty' => $course['difficulty'] ?? 'Beginner',
                        'learning_objectives' => !empty($ft['learning_objectives']) ? explode("\n", $ft['learning_objectives']) : [],
                        'quizzes' => []
                    ];
                }
                $modules = [[
                    'module_id' => 1,
                    'id' => 1,
                    'module_name' => 'Module 1: Core Curriculum',
                    'title' => 'Module 1: Core Curriculum',
                    'description' => 'Fundamental concepts and practical exercises',
                    'duration' => $course['duration'] ?? '4 Weeks',
                    'difficulty' => $course['difficulty'] ?? 'Beginner',
                    'learning_objectives' => $outcomes,
                    'topics' => $modTopics
                ]];
            }
        } else {
            foreach ($modules as &$module) {
                $module['module_name'] = $module['title'];
                $module['id'] = $module['module_id'];
                if (isset($module['learning_objectives']) && is_string($module['learning_objectives'])) {
                    $decoded = json_decode($module['learning_objectives'], true);
                    $module['learning_objectives'] = is_array($decoded) ? $decoded : [$module['learning_objectives']];
                }

                $stmt = $pdo->prepare("SELECT * FROM course_topics WHERE module_id = ? ORDER BY order_index ASC, topic_id ASC");
                $stmt->execute([$module['module_id']]);
                $topics = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($topics as &$topic) {
                    $topic['topic_name'] = $topic['title'];
                    $topic['id'] = $topic['topic_id'];
                    $topic['examples'] = $topic['code_example'] ?? '';
                    if (isset($topic['learning_objectives']) && is_string($topic['learning_objectives'])) {
                        $decoded = json_decode($topic['learning_objectives'], true);
                        $topic['learning_objectives'] = is_array($decoded) ? $decoded : [$topic['learning_objectives']];
                    }

                    // Topic quizzes
                    $stmtQ = $pdo->prepare("SELECT * FROM quizzes WHERE topic_id = ? OR (course_id = ? AND module_name = ?)");
                    $stmtQ->execute([$topic['topic_id'], $course_id, $module['module_name']]);
                    $quizzes = $stmtQ->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($quizzes as &$quiz) {
                        $quiz['id'] = $quiz['quiz_id'];
                        $quiz['title'] = $quiz['quiz_title'] ?? $quiz['title'];
                        $stmtQuest = $pdo->prepare("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_id ASC");
                        $stmtQuest->execute([$quiz['quiz_id']]);
                        $questions = $stmtQuest->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($questions as &$q) {
                            if (isset($q['options']) && is_string($q['options'])) {
                                $q['options'] = json_decode($q['options'], true);
                            }
                        }
                        $quiz['questions'] = $questions;
                    }
                    $topic['quizzes'] = $quizzes;
                }
                $module['topics'] = $topics;
            }
        }

        $course['id'] = $course['course_id'];
        $course['course_name'] = $course['course_name'] ?? $course['title'];
        $course['difficulty'] = $course['difficulty'] ?? $course['difficulty_level'] ?? 'Beginner';
        $course['modules'] = $modules;

        echo json_encode($course);
        exit();
    } else {
        // List courses
        $stmt = $pdo->prepare("
            SELECT c.*,
                   (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id) as enrolled_count,
                   (SELECT COUNT(*) FROM course_modules WHERE course_id = c.course_id) as modules_count,
                   (SELECT COUNT(*) FROM topics WHERE course_id = c.course_id) as topics_count
            FROM courses c
            WHERE c.teacher_id = :tid OR c.instructor_id = :tid
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([':tid' => $teacher_id]);
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($courses)) {
            $stmt = $pdo->query("
                SELECT c.*,
                       (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id) as enrolled_count,
                       (SELECT COUNT(*) FROM course_modules WHERE course_id = c.course_id) as modules_count,
                       (SELECT COUNT(*) FROM topics WHERE course_id = c.course_id) as topics_count
                FROM courses c
                ORDER BY c.created_at DESC
            ");
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        foreach ($courses as &$c) {
            $c['course_name'] = $c['course_name'] ?? $c['title'];
            $c['title'] = $c['course_name'];
            $c['id'] = $c['course_id'];
            $c['difficulty'] = $c['difficulty'] ?? $c['difficulty_level'] ?? 'Beginner';
        }

        echo json_encode($courses);
        exit();
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];
    $action = $data['action'] ?? 'save_draft';

    if ($action === 'save_draft' || $action === 'publish') {
        try {
            $pdo->beginTransaction();

            $status = ($action === 'publish') ? 'Published' : 'Draft';
            $course_name = $data['course_name'] ?? $data['title'] ?? 'Untitled Course';
            $description = $data['description'] ?? '';
            $difficulty = $data['difficulty'] ?? $data['difficulty_level'] ?? 'Beginner';
            $category = $data['category'] ?? 'Computer Science';
            $duration = $data['duration'] ?? '8 Weeks';
            $target_audience = $data['target_audience'] ?? '';
            $prerequisites = is_array($data['prerequisites'] ?? null) ? implode(', ', $data['prerequisites']) : ($data['prerequisites'] ?? '');
            $creation_method = $data['creation_method'] ?? 'manual';
            $thumbnail = $data['thumbnail'] ?? null;
            $banner = $data['banner'] ?? null;
            $objectivesRaw = $data['learning_objectives'] ?? [];
            $objectivesStr = is_array($objectivesRaw) ? json_encode($objectivesRaw) : (string)$objectivesRaw;

            $course_id = null;
            if (!empty($data['id']) || !empty($data['course_id'])) {
                $course_id = mapCourseIdToDb($data['id'] ?? $data['course_id']);
                $stmt = $pdo->prepare("
                    UPDATE courses SET 
                        course_name = ?, title = ?, description = ?, difficulty = ?, difficulty_level = ?,
                        status = ?, category = ?, duration = ?, target_audience = ?, prerequisites = ?,
                        creation_method = ?, thumbnail = COALESCE(?, thumbnail), banner = COALESCE(?, banner),
                        learning_objectives = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE course_id = ?
                ");
                $stmt->execute([
                    $course_name, $course_name, $description, $difficulty, $difficulty,
                    $status, $category, $duration, $target_audience, $prerequisites,
                    $creation_method, $thumbnail, $banner, $objectivesStr, $course_id
                ]);

                // Clear child tables for clean rewrite
                $pdo->prepare("DELETE FROM course_modules WHERE course_id = ?")->execute([$course_id]);
                $pdo->prepare("DELETE FROM course_learning_outcomes WHERE course_id = ?")->execute([$course_id]);
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO courses 
                    (instructor_id, teacher_id, course_name, title, description, difficulty, difficulty_level,
                     status, category, duration, target_audience, prerequisites, creation_method, thumbnail, banner, learning_objectives)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    RETURNING course_id
                ");
                $stmt->execute([
                    $teacher_id, $teacher_id, $course_name, $course_name, $description, $difficulty, $difficulty,
                    $status, $category, $duration, $target_audience, $prerequisites, $creation_method, $thumbnail, $banner, $objectivesStr
                ]);
                $course_id = (int)$stmt->fetchColumn();
            }

            // Learning Outcomes
            if (is_array($objectivesRaw)) {
                $outStmt = $pdo->prepare("INSERT INTO course_learning_outcomes (course_id, outcome_text, display_order) VALUES (?, ?, ?)");
                foreach ($objectivesRaw as $idx => $outcome) {
                    if (trim($outcome)) {
                        $outStmt->execute([$course_id, trim($outcome), $idx]);
                    }
                }
            }

            // Modules & Topics
            if (!empty($data['modules']) && is_array($data['modules'])) {
                $topicGlobalOrder = 1;
                foreach ($data['modules'] as $mIndex => $module) {
                    $mTitle = $module['module_name'] ?? $module['title'] ?? 'Untitled Module';
                    $mDesc = $module['description'] ?? '';
                    $mDiff = $module['difficulty'] ?? $difficulty;
                    $mDur = $module['duration'] ?? '2 Weeks';
                    $mObjs = is_array($module['learning_objectives'] ?? null) ? json_encode($module['learning_objectives']) : '';

                    $stmt = $pdo->prepare("
                        INSERT INTO course_modules (course_id, title, description, order_index, learning_objectives, duration, difficulty)
                        VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING module_id
                    ");
                    $stmt->execute([$course_id, $mTitle, $mDesc, $mIndex, $mObjs, $mDur, $mDiff]);
                    $module_id = (int)$stmt->fetchColumn();

                    if (!empty($module['topics']) && is_array($module['topics'])) {
                        foreach ($module['topics'] as $tIndex => $topic) {
                            $tTitle = $topic['topic_name'] ?? $topic['title'] ?? 'Untitled Topic';
                            $tDesc = $topic['description'] ?? '';
                            $tContent = $topic['content'] ?? $tDesc;
                            $tEx = $topic['examples'] ?? $topic['code_example'] ?? '';
                            $tConcepts = $topic['important_concepts'] ?? '';
                            $tDiff = $topic['difficulty'] ?? $mDiff;
                            $tDur = $topic['duration'] ?? '45 mins';
                            $tObjs = is_array($topic['learning_objectives'] ?? null) ? json_encode($topic['learning_objectives']) : '';

                            // Insert into course_topics
                            $stmt = $pdo->prepare("
                                INSERT INTO course_topics (module_id, title, content, code_example, order_index, learning_objectives, important_concepts, duration, difficulty)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING topic_id
                            ");
                            $stmt->execute([$module_id, $tTitle, $tContent, $tEx, $tIndex, $tObjs, $tConcepts, $tDur, $tDiff]);
                            $topic_id = (int)$stmt->fetchColumn();

                            // Also sync to topics table for cross-platform compatibility
                            try {
                                $stmtT = $pdo->prepare("
                                    INSERT INTO topics (course_id, topic_name, category, description, content, learning_objectives, topic_order)
                                    VALUES (?, ?, ?, ?, ?, ?, ?)
                                ");
                                $stmtT->execute([$course_id, $tTitle, $tConcepts ?: 'General', $tDesc, $tContent, is_array($topic['learning_objectives'] ?? null) ? implode("\n", $topic['learning_objectives']) : '', $topicGlobalOrder++]);
                            } catch (Exception $e) {}

                            // Topic Quizzes if present
                            if (!empty($topic['quizzes']) && is_array($topic['quizzes'])) {
                                foreach ($topic['quizzes'] as $quiz) {
                                    $qTitle = $quiz['quiz_title'] ?? $quiz['title'] ?? ($tTitle . ' Assessment');
                                    $stmtQ = $pdo->prepare("
                                        INSERT INTO quizzes (course_id, module_id, topic_id, quiz_title, title, description, time_limit, passing_marks, difficulty, creation_method, status, total_marks, teacher_id)
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING quiz_id
                                    ");
                                    $stmtQ->execute([
                                        $course_id, $module_id, $topic_id, $qTitle, $qTitle,
                                        $quiz['description'] ?? '', $quiz['time_limit'] ?? 15, $quiz['passing_marks'] ?? 50,
                                        $quiz['difficulty'] ?? $tDiff, $creation_method, $status, $quiz['total_marks'] ?? 100, $teacher_id
                                    ]);
                                    $quiz_id = (int)$stmtQ->fetchColumn();

                                    if (!empty($quiz['questions']) && is_array($quiz['questions'])) {
                                        $questStmt = $pdo->prepare("
                                            INSERT INTO quiz_questions (quiz_id, course_id, module_id, topic_id, question_text, question_type, options, correct_answer, points)
                                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                                        ");
                                        foreach ($quiz['questions'] as $q) {
                                            $questStmt->execute([
                                                $quiz_id, $course_id, $module_id, $topic_id,
                                                $q['question_text'] ?? $q['question'] ?? 'Question',
                                                $q['question_type'] ?? 'multiple_choice',
                                                is_array($q['options']) ? json_encode($q['options']) : ($q['options'] ?? '[]'),
                                                $q['correct_answer'] ?? '',
                                                $q['points'] ?? $q['marks'] ?? 1
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

            $stmt = $pdo->prepare("SELECT * FROM courses WHERE course_id = ?");
            $stmt->execute([$course_id]);
            $updatedCourse = $stmt->fetch(PDO::FETCH_ASSOC);
            $updatedCourse['id'] = $course_id;
            $updatedCourse['course_name'] = $updatedCourse['course_name'] ?? $updatedCourse['title'];

            echo json_encode([
                "status" => "success",
                "message" => "Course {$action} successfully.",
                "course" => $updatedCourse
            ]);
            exit();

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Failed to save course: " . $e->getMessage()]);
            exit();
        }
    }

    if ($action === 'duplicate') {
        $sourceId = mapCourseIdToDb($data['id'] ?? $data['course_id'] ?? null);
        if (!$sourceId) {
            http_response_code(400);
            echo json_encode(["error" => "Course ID is required for duplication."]);
            exit();
        }

        try {
            $pdo->beginTransaction();

            // Fetch source course
            $stmt = $pdo->prepare("SELECT * FROM courses WHERE course_id = ?");
            $stmt->execute([$sourceId]);
            $src = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$src) {
                http_response_code(404);
                echo json_encode(["error" => "Source course not found."]);
                exit();
            }

            $newTitle = ($src['course_name'] ?? $src['title']) . " (Copy)";

            // Insert new course
            $insStmt = $pdo->prepare("
                INSERT INTO courses 
                (instructor_id, teacher_id, course_name, title, description, difficulty, difficulty_level,
                 status, category, duration, target_audience, prerequisites, creation_method, thumbnail, banner, learning_objectives)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING course_id
            ");
            $insStmt->execute([
                $teacher_id, $teacher_id, $newTitle, $newTitle, $src['description'], $src['difficulty'], $src['difficulty_level'],
                $src['category'], $src['duration'], $src['target_audience'], $src['prerequisites'],
                $src['creation_method'], $src['thumbnail'], $src['banner'], $src['learning_objectives']
            ]);
            $newCourseId = (int)$insStmt->fetchColumn();

            // Duplicate course_learning_outcomes
            $stmt = $pdo->prepare("SELECT outcome_text, display_order FROM course_learning_outcomes WHERE course_id = ?");
            $stmt->execute([$sourceId]);
            $outcomes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $insOut = $pdo->prepare("INSERT INTO course_learning_outcomes (course_id, outcome_text, display_order) VALUES (?, ?, ?)");
            foreach ($outcomes as $out) {
                $insOut->execute([$newCourseId, $out['outcome_text'], $out['display_order']]);
            }

            // Duplicate modules and topics
            $stmt = $pdo->prepare("SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC");
            $stmt->execute([$sourceId]);
            $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $insMod = $pdo->prepare("
                INSERT INTO course_modules (course_id, title, description, order_index, learning_objectives, duration, difficulty)
                VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING module_id
            ");
            $insTop = $pdo->prepare("
                INSERT INTO course_topics (module_id, title, content, code_example, order_index, learning_objectives, important_concepts, duration, difficulty)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING topic_id
            ");

            foreach ($modules as $mod) {
                $insMod->execute([$newCourseId, $mod['title'], $mod['description'], $mod['order_index'], $mod['learning_objectives'], $mod['duration'], $mod['difficulty']]);
                $newModId = (int)$insMod->fetchColumn();

                $stmtT = $pdo->prepare("SELECT * FROM course_topics WHERE module_id = ? ORDER BY order_index ASC");
                $stmtT->execute([$mod['module_id']]);
                $topics = $stmtT->fetchAll(PDO::FETCH_ASSOC);

                foreach ($topics as $top) {
                    $insTop->execute([$newModId, $top['title'], $top['content'], $top['code_example'], $top['order_index'], $top['learning_objectives'], $top['important_concepts'], $top['duration'], $top['difficulty']]);
                }
            }

            $pdo->commit();

            echo json_encode([
                "status" => "success",
                "message" => "Course duplicated successfully.",
                "course_id" => $newCourseId,
                "id" => $newCourseId
            ]);
            exit();

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Duplication failed: " . $e->getMessage()]);
            exit();
        }
    }

    if ($action === 'archive') {
        $cid = mapCourseIdToDb($data['id'] ?? null);
        if ($cid) {
            $stmt = $pdo->prepare("UPDATE courses SET status = 'Archived', updated_at = CURRENT_TIMESTAMP WHERE course_id = ?");
            $stmt->execute([$cid]);
            echo json_encode(["status" => "success", "message" => "Course archived."]);
            exit();
        }
    }

    if ($action === 'delete') {
        $cid = mapCourseIdToDb($data['id'] ?? null);
        if ($cid) {
            $stmt = $pdo->prepare("DELETE FROM courses WHERE course_id = ?");
            $stmt->execute([$cid]);
            echo json_encode(["status" => "success", "message" => "Course deleted."]);
            exit();
        }
    }
}

if ($method === 'DELETE') {
    $cid = mapCourseIdToDb($_GET['id'] ?? null);
    if ($cid) {
        $stmt = $pdo->prepare("DELETE FROM courses WHERE course_id = ?");
        $stmt->execute([$cid]);
        echo json_encode(["status" => "success", "message" => "Course deleted."]);
        exit();
    }
    http_response_code(400);
    echo json_encode(["error" => "Course ID is required."]);
    exit();
}
?>
