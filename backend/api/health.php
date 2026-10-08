<?php
$startTime = microtime(true);

require_once __DIR__ . '/config.php';

$response = [
    "status" => "unknown",
    "timestamp" => date('Y-m-d H:i:s'),
    "php_version" => phpversion(),
    "database" => [
        "connected" => false,
        "database_name" => $db,
        "tables" => []
    ],
    "responseTimeMs" => 0
];

try {
    if (isset($pdo) && $pdo instanceof PDO) {
        $response["database"]["connected"] = true;
        
        $vStmt = $pdo->query("SELECT VERSION() as version");
        $version = $vStmt->fetch(PDO::FETCH_ASSOC);
        $response["database"]["server_version"] = $version['version'] ?? 'unknown';

        $tablesToCheck = [
            'users' => 'Total Users',
            'courses' => 'Total Courses',
            'course_modules' => 'Course Modules',
            'topics' => 'Total Topics',
            'quizzes' => 'Total Quizzes',
            'questions' => 'Total Questions',
            'assignments' => 'Total Assignments',
            'assignment_submissions' => 'Assignment Submissions',
            'quiz_results' => 'Quiz Results',
            'enrollments' => 'Total Enrollments',
            'teacher_interventions' => 'Interventions',
            'notifications' => 'Notifications'
        ];

        foreach ($tablesToCheck as $tbl => $label) {
            try {
                $cntStmt = $pdo->query("SELECT COUNT(*) as count FROM $tbl");
                $count = (int)$cntStmt->fetch(PDO::FETCH_ASSOC)['count'];
                $response["database"]["tables"][$tbl] = [
                    "label" => $label,
                    "count" => $count
                ];
            } catch (Exception $te) {
                $response["database"]["tables"][$tbl] = [
                    "label" => $label,
                    "count" => 0,
                    "error" => $te->getMessage()
                ];
            }
        }

        $response["status"] = "healthy";
        $response["message"] = "Learning Analytics Platform API and PostgreSQL Database are fully operational.";
    } else {
        $response["status"] = "unhealthy";
        $response["message"] = "Database connection variable not initialized.";
    }
} catch (Throwable $e) {
    http_response_code(500);
    $response["status"] = "error";
    $response["message"] = "Health check failed: " . $e->getMessage();
    $response["error"] = $e->getMessage();
}

$response["responseTimeMs"] = round((microtime(true) - $startTime) * 1000, 2);
echo json_encode($response, JSON_PRETTY_PRINT);
?>
