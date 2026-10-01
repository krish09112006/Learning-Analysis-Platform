<?php
require_once "C:/xampp/htdocs/learning-analytics-backend/config/database.php";

echo "Resuming Assignment Module Database Migration...\n";

try {
    // 4. Alter `assignment_submissions` table (fixed)
    // First update 'Graded' to 'Evaluated' (if we can, but it's an ENUM. So we alter the ENUM to include both temporarily, then update, then remove Graded)
    $conn->exec("
        ALTER TABLE assignment_submissions
        MODIFY COLUMN status ENUM('Not Submitted', 'Submitted', 'Pending Evaluation', 'Evaluated', 'Returned for Revision', 'Late', 'Resubmitted', 'Graded') DEFAULT 'Submitted';
    ");
    
    $conn->exec("UPDATE assignment_submissions SET status = 'Evaluated' WHERE status = 'Graded'");
    
    $conn->exec("
        ALTER TABLE assignment_submissions
        MODIFY COLUMN status ENUM('Not Submitted', 'Submitted', 'Pending Evaluation', 'Evaluated', 'Returned for Revision', 'Late', 'Resubmitted') DEFAULT 'Submitted';
    ");

    $conn->exec("
        ALTER TABLE assignment_submissions
        ADD COLUMN attempt_number INT DEFAULT 1 AFTER student_id,
        ADD COLUMN is_late TINYINT(1) DEFAULT 0 AFTER status;
    ");
    echo "Altered assignment_submissions table.\n";

    // 5. Create `assignment_submission_files` table (for multiple student files)
    $conn->exec("
        CREATE TABLE IF NOT EXISTS assignment_submission_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            submission_id INT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            storage_key VARCHAR(500) NOT NULL,
            mime_type VARCHAR(100),
            file_size INT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (submission_id) REFERENCES assignment_submissions(submission_id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ");
    
    // Migrate existing single files to the new files table (IGNORE errors if already migrated)
    try {
        $conn->exec("
            INSERT IGNORE INTO assignment_submission_files (submission_id, file_name, storage_key)
            SELECT submission_id, file_name, IFNULL(file_url, file_name) FROM assignment_submissions WHERE file_name IS NOT NULL AND file_name != '';
        ");
    } catch (Exception $e) {}
    
    echo "Created assignment_submission_files table.\n";

    // 6. Create `assignment_evaluations` table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS assignment_evaluations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            submission_id INT NOT NULL,
            evaluator_id INT NOT NULL,
            marks_awarded INT,
            feedback TEXT,
            private_notes TEXT,
            evaluation_status ENUM('Draft', 'Published') DEFAULT 'Published',
            evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            released_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (submission_id) REFERENCES assignment_submissions(submission_id) ON DELETE CASCADE,
            FOREIGN KEY (evaluator_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ");
    
    // Migrate existing grades
    try {
        $conn->exec("
            INSERT IGNORE INTO assignment_evaluations (submission_id, evaluator_id, marks_awarded, feedback, evaluated_at, released_at)
            SELECT s.submission_id, a.course_id, s.marks_awarded, s.feedback, s.graded_at, s.graded_at
            FROM assignment_submissions s
            JOIN assignments a ON s.assignment_id = a.assignment_id
            WHERE s.marks_awarded IS NOT NULL;
        ");
    } catch (Exception $e) {}
    
    echo "Created assignment_evaluations table.\n";
    
    echo "\nMigration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration Failed: " . $e->getMessage() . "\n";
}
?>
