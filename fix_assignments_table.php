<?php
require_once "C:/xampp/htdocs/learning-analytics-backend/config/database.php";

echo "Running Assignments Table Migration...\n";

$queries = [
    "ALTER TABLE assignments ADD COLUMN module_id INT NULL AFTER course_id",
    "ALTER TABLE assignments ADD COLUMN assignment_code VARCHAR(50) NULL AFTER title",
    "ALTER TABLE assignments ADD COLUMN category VARCHAR(100) DEFAULT 'General' AFTER instructions",
    "ALTER TABLE assignments ADD COLUMN difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate' AFTER category",
    "ALTER TABLE assignments ADD COLUMN passing_marks INT NULL AFTER max_marks",
    "ALTER TABLE assignments ADD COLUMN estimated_duration INT NULL COMMENT 'in minutes' AFTER passing_marks",
    "ALTER TABLE assignments ADD COLUMN start_at TIMESTAMP NULL AFTER estimated_duration",
    "ALTER TABLE assignments ADD COLUMN due_at TIMESTAMP NULL AFTER start_at",
    "ALTER TABLE assignments ADD COLUMN late_deadline TIMESTAMP NULL AFTER due_at",
    "ALTER TABLE assignments ADD COLUMN submission_type ENUM('File Upload', 'Text Submission', 'File and Text', 'External Link') DEFAULT 'File Upload' AFTER late_deadline",
    "ALTER TABLE assignments ADD COLUMN allowed_file_types VARCHAR(255) DEFAULT '.pdf,.doc,.docx,.zip' AFTER submission_type",
    "ALTER TABLE assignments ADD COLUMN max_file_size INT DEFAULT 10485760 COMMENT 'in bytes' AFTER allowed_file_types",
    "ALTER TABLE assignments ADD COLUMN max_files INT DEFAULT 1 AFTER max_file_size",
    "ALTER TABLE assignments ADD COLUMN max_attempts INT DEFAULT 1 AFTER max_files",
    "ALTER TABLE assignments ADD COLUMN allow_resubmission TINYINT(1) DEFAULT 0 AFTER max_attempts",
    "ALTER TABLE assignments ADD COLUMN accept_late_submissions TINYINT(1) DEFAULT 0 AFTER allow_resubmission",
    "ALTER TABLE assignments ADD COLUMN late_policy VARCHAR(255) NULL AFTER accept_late_submissions",
    "ALTER TABLE assignments ADD COLUMN grading_method ENUM('Manual Grading', 'Rubric-based Grading') DEFAULT 'Manual Grading' AFTER late_policy",
    "ALTER TABLE assignments ADD COLUMN feedback_required TINYINT(1) DEFAULT 0 AFTER grading_method",
    "ALTER TABLE assignments ADD COLUMN grade_release_mode ENUM('Release after each evaluation', 'Release manually by teacher') DEFAULT 'Release after each evaluation' AFTER feedback_required",
    "ALTER TABLE assignments ADD COLUMN status ENUM('Draft', 'Scheduled', 'Published', 'Closed', 'Archived') DEFAULT 'Draft' AFTER grade_release_mode"
];

foreach ($queries as $q) {
    try {
        $conn->exec($q);
        echo "Success: $q\n";
    } catch (Exception $e) {
        echo "Failed: $q\nError: " . $e->getMessage() . "\n";
    }
}

try {
    $conn->exec("UPDATE assignments SET due_at = due_date WHERE due_at IS NULL AND due_date IS NOT NULL");
    echo "Success: Copied due_date to due_at\n";
} catch (Exception $e) {
    echo "Failed to copy due_date: " . $e->getMessage() . "\n";
}

echo "Migration finished.\n";
?>
