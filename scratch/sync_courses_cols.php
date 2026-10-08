<?php
require 'backend/api/config.php';

try {
    $pdo->exec("
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS teacher_id INT;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS title VARCHAR(255);
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50);
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_audience VARCHAR(255);
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS banner VARCHAR(500);
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS creation_method VARCHAR(50) DEFAULT 'manual';
        
        UPDATE courses SET teacher_id = instructor_id WHERE teacher_id IS NULL AND instructor_id IS NOT NULL;
        UPDATE courses SET instructor_id = teacher_id WHERE instructor_id IS NULL AND teacher_id IS NOT NULL;
        UPDATE courses SET title = course_name WHERE title IS NULL AND course_name IS NOT NULL;
        UPDATE courses SET course_name = title WHERE course_name IS NULL AND title IS NOT NULL;
        UPDATE courses SET difficulty_level = difficulty WHERE difficulty_level IS NULL AND difficulty IS NOT NULL;
    ");
    echo "Courses schema updated successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
