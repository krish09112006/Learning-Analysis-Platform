<?php
require 'backend/api/config.php';
$pdo->exec("
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS title VARCHAR(255);
    UPDATE quizzes SET title = quiz_title WHERE title IS NULL;
    UPDATE quizzes SET quiz_title = title WHERE quiz_title IS NULL;

    ALTER TABLE topics ADD COLUMN IF NOT EXISTS title VARCHAR(255);
    UPDATE topics SET title = topic_name WHERE title IS NULL;
    UPDATE topics SET topic_name = title WHERE topic_name IS NULL;
");
echo "Quizzes and Topics dual columns synced.\n";
