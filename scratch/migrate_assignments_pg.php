<?php
require 'backend/api/config.php';

$queries = [
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS module_id INT",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS assignment_code VARCHAR(50)",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Lab'",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'Intermediate'",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS passing_marks INT DEFAULT 50",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS estimated_duration INT DEFAULT 60",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS start_at TIMESTAMP",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS due_at TIMESTAMP",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS late_deadline TIMESTAMP",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS submission_type VARCHAR(50) DEFAULT 'File Upload'",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS allowed_file_types VARCHAR(255) DEFAULT '.pdf,.doc,.docx,.zip,.py,.js'",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS max_file_size BIGINT DEFAULT 10485760",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS max_files INT DEFAULT 1",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS max_attempts INT DEFAULT 1",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT FALSE",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS accept_late_submissions BOOLEAN DEFAULT FALSE",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS late_policy TEXT",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS grading_method VARCHAR(50) DEFAULT 'Manual Grading'",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS feedback_required BOOLEAN DEFAULT FALSE",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS grade_release_mode VARCHAR(100) DEFAULT 'Release after each evaluation'",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft'",
    "ALTER TABLE assignments ADD COLUMN IF NOT EXISTS total_marks INT DEFAULT 100",
    "UPDATE assignments SET due_at = due_date WHERE due_at IS NULL AND due_date IS NOT NULL",
    "UPDATE assignments SET total_marks = max_marks WHERE total_marks IS NULL AND max_marks IS NOT NULL"
];

foreach ($queries as $q) {
    try {
        $pdo->exec($q);
        echo "OK: " . substr($q, 0, 45) . "...\n";
    } catch (Exception $e) {
        echo "ERR: " . $e->getMessage() . "\n";
    }
}
echo "Assignments schema updated.\n";
