<?php
require 'backend/api/config.php';
$targetTables = [
    'users', 'courses', 'course_modules', 'course_topics', 'topics', 
    'course_materials', 'quizzes', 'quiz_questions', 'questions',
    'assignments', 'assignment_submissions', 'teacher_interventions',
    'notifications', 'quiz_results', 'student_progress', 'enrollments'
];

foreach ($targetTables as $table) {
    echo "=== Table: $table ===\n";
    $cols = $pdo->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '$table' ORDER BY ordinal_position")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo "  - " . $c['column_name'] . " (" . $c['data_type'] . ")\n";
    }
}
