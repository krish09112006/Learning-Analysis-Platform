<?php
require 'backend/api/config.php';

$queries = [
    "ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS teacher_id INT REFERENCES users(user_id) ON DELETE SET NULL",
    "ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS topic_name VARCHAR(255)",
    "ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS options_json TEXT",
    "ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)",
    "ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS usage_count INT DEFAULT 0"
];

foreach ($queries as $q) {
    try {
        $pdo->exec($q);
        echo "OK: $q\n";
    } catch (Exception $e) {
        echo "ERR: " . $e->getMessage() . "\n";
    }
}
echo "question_bank columns updated.\n";
