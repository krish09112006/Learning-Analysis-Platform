<?php
require 'backend/api/config.php';
$hasTable = $pdo->query("SELECT to_regclass('public.question_options')")->fetchColumn();
echo "question_options table exists: " . ($hasTable ? 'YES' : 'NO') . "\n";
$hasQuestions = $pdo->query("SELECT to_regclass('public.questions')")->fetchColumn();
echo "questions table exists: " . ($hasQuestions ? 'YES' : 'NO') . "\n";
$hasQuizQuestions = $pdo->query("SELECT to_regclass('public.quiz_questions')")->fetchColumn();
echo "quiz_questions table exists: " . ($hasQuizQuestions ? 'YES' : 'NO') . "\n";
