<?php
require 'backend/api/config.php';

$queries = [
    "ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS attempt_number INT DEFAULT 1",
    "ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE",
    "CREATE TABLE IF NOT EXISTS assignment_submission_files (
        id SERIAL PRIMARY KEY,
        submission_id INT NOT NULL REFERENCES assignment_submissions(submission_id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        storage_key VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100),
        file_size INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS assignment_evaluations (
        id SERIAL PRIMARY KEY,
        submission_id INT NOT NULL REFERENCES assignment_submissions(submission_id) ON DELETE CASCADE,
        evaluator_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        marks_awarded INT,
        feedback TEXT,
        private_notes TEXT,
        evaluation_status VARCHAR(50) DEFAULT 'Published',
        evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        released_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    // Also question_bank table if not exists!
    "CREATE TABLE IF NOT EXISTS question_bank (
        id SERIAL PRIMARY KEY,
        course_id INT REFERENCES courses(course_id) ON DELETE SET NULL,
        topic_id INT REFERENCES topics(topic_id) ON DELETE SET NULL,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'mcq',
        difficulty VARCHAR(50) DEFAULT 'Beginner',
        marks INT DEFAULT 1,
        negative_marks NUMERIC(4,2) DEFAULT 0,
        options JSONB,
        correct_answer TEXT,
        explanation TEXT,
        tags VARCHAR(255),
        created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($queries as $q) {
    try {
        $pdo->exec($q);
        echo "OK: " . substr($q, 0, 50) . "...\n";
    } catch (Exception $e) {
        echo "ERR: " . $e->getMessage() . "\n";
    }
}
echo "Submissions and Question Bank migration completed.\n";
