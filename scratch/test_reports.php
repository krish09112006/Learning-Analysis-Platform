<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['instructor_id'] = 2;
$_GET['type'] = 'course_progress';
require 'backend/api/teacher_reports.php';
