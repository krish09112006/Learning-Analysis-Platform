<?php
require 'config.php';

$queries = [
    // quiz_results
    "CREATE TABLE IF NOT EXISTS quiz_results (
        result_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        quiz_id INT REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
        score INT,
        percentage NUMERIC(5,2),
        time_taken INT,
        attempt_number INT DEFAULT 1,
        attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    // student_progress
    "CREATE TABLE IF NOT EXISTS student_progress (
        progress_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        topic_id INT REFERENCES course_topics(topic_id) ON DELETE CASCADE,
        completion_status BOOLEAN DEFAULT FALSE,
        completion_percentage NUMERIC(5,2) DEFAULT 0.0,
        time_spent INT DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    // teacher_interventions
    "CREATE TABLE IF NOT EXISTS teacher_interventions (
        intervention_id SERIAL PRIMARY KEY,
        teacher_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        topic_id INT REFERENCES course_topics(topic_id) ON DELETE CASCADE,
        reason VARCHAR(255),
        trigger_metric VARCHAR(255),
        recommended_action TEXT,
        teacher_notes TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
    )",

    // enrollments
    "CREATE TABLE IF NOT EXISTS enrollments (
        enrollment_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
];

foreach ($queries as $query) {
    try {
        $pdo->exec($query);
        echo "Executed: " . substr($query, 0, 50) . "...\n";
    } catch (PDOException $e) {
        echo "Error on query: " . $e->getMessage() . "\n";
    }
}
echo "Analytics Migration completed.\n";
?>
