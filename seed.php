<?php
require_once "C:/xampp/htdocs/learning-analytics-backend/config/database.php"; 

$stmt = $conn->query("SELECT course_id FROM courses LIMIT 1");
$course = $stmt->fetch();
$course_id = $course["course_id"] ?? 1;

$stmt = $conn->query("SELECT topic_id FROM topics LIMIT 1");
$topic = $stmt->fetch();
$topic_id = $topic["topic_id"] ?? 1;

$stmt = $conn->query("SELECT user_id FROM users WHERE role='Student' LIMIT 2");
$students = $stmt->fetchAll();
$student1_id = $students[0]["user_id"] ?? 1;
$student2_id = $students[1]["user_id"] ?? 2;

$conn->exec("INSERT INTO assignments (course_id, topic_id, title, description, instructions, due_date, max_marks) VALUES 
($course_id, $topic_id, 'Assignment 1: Fundamentals', 'Implement basic functions and data structures.', 'Write the code in Python and submit the .py file.', DATE_ADD(NOW(), INTERVAL 7 DAY), 100),
($course_id, $topic_id, 'Assignment 2: Advanced Algorithms', 'Design and implement a sorting algorithm.', 'Submit a written report along with your code.', DATE_ADD(NOW(), INTERVAL 14 DAY), 50)");

$assignment_id = $conn->lastInsertId();
$assignment1_id = $assignment_id - 1;

$conn->exec("INSERT INTO assignment_submissions (assignment_id, student_id, file_name, submission_text, status, submitted_at) VALUES 
($assignment1_id, $student1_id, 'main.py', 'Here is my submission.', 'Submitted', NOW()),
($assignment1_id, $student2_id, 'algo.py', 'I had some trouble with the recursion.', 'Submitted', NOW())");

echo "Seeded successfully!";
?>
