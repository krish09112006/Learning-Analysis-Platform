<?php
require 'learning-analytics-backend/config/database.php';
$users = $conn->query("SELECT user_id, name, email, role FROM users")->fetchAll();
echo "Users in DB:\n";
print_r($users);
$courses = $conn->query("SELECT course_id, course_name, instructor_id, status FROM courses")->fetchAll();
echo "\nCourses in DB:\n";
print_r($courses);
