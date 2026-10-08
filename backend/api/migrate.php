<?php
require 'config.php';

$queries = [
    // courses
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100)",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS subject VARCHAR(100)",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration VARCHAR(100)",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_audience VARCHAR(255)",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500)",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS banner VARCHAR(500)",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS creation_method VARCHAR(50) DEFAULT 'manual'",
    
    // course_modules
    "ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS learning_objectives TEXT",
    "ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS duration VARCHAR(100)",
    "ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50)",
    
    // course_topics
    "ALTER TABLE course_topics ADD COLUMN IF NOT EXISTS learning_objectives TEXT",
    "ALTER TABLE course_topics ADD COLUMN IF NOT EXISTS important_concepts TEXT",
    "ALTER TABLE course_topics ADD COLUMN IF NOT EXISTS duration VARCHAR(100)",
    "ALTER TABLE course_topics ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50)",
    "ALTER TABLE course_topics ADD COLUMN IF NOT EXISTS image VARCHAR(500)",

    // course_learning_outcomes
    "CREATE TABLE IF NOT EXISTS course_learning_outcomes (
        id SERIAL PRIMARY KEY,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        outcome_text TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    // code_examples
    "CREATE TABLE IF NOT EXISTS code_examples (
        id SERIAL PRIMARY KEY,
        topic_id INT REFERENCES course_topics(topic_id) ON DELETE CASCADE,
        title VARCHAR(255),
        language VARCHAR(50),
        code TEXT NOT NULL,
        expected_output TEXT,
        explanation TEXT,
        difficulty VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    // quizzes
    "ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS time_limit INT",
    "ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS passing_marks INT",
    "ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50)",
    "ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS creation_method VARCHAR(50) DEFAULT 'manual'",
    "ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft'",
    "ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS total_marks INT",

    // quiz_questions
    "ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS course_id INT REFERENCES courses(course_id) ON DELETE CASCADE",
    "ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS module_id INT REFERENCES course_modules(module_id) ON DELETE CASCADE",
    "ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS topic_id INT REFERENCES course_topics(topic_id) ON DELETE CASCADE",
    "ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50)",
    "ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation TEXT",
    "ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0",
    "ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS marks INT DEFAULT 1",

    // assignments
    "CREATE TABLE IF NOT EXISTS assignments (
        assignment_id SERIAL PRIMARY KEY,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        module_id INT REFERENCES course_modules(module_id) ON DELETE CASCADE,
        topic_id INT REFERENCES course_topics(topic_id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        attachment VARCHAR(500),
        due_date TIMESTAMP,
        maximum_marks INT DEFAULT 100,
        submission_type VARCHAR(50),
        late_submission_policy TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    // assignment_submissions
    "CREATE TABLE IF NOT EXISTS assignment_submissions (
        submission_id SERIAL PRIMARY KEY,
        assignment_id INT REFERENCES assignments(assignment_id) ON DELETE CASCADE,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        file_name VARCHAR(255),
        file_url VARCHAR(500),
        submission_text TEXT,
        marks_awarded INT,
        feedback TEXT,
        status VARCHAR(50) DEFAULT 'Submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        graded_at TIMESTAMP
    )",
    
    // notifications
    "CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT,
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($queries as $query) {
    try {
        $pdo->exec($query);
        echo "Executed: " . substr($query, 0, 50) . "...\n";
    } catch (PDOException $e) {
        echo "Error on query: " . $e->getMessage() . "\n";
    }
}
echo "Migration completed.\n";
?>
