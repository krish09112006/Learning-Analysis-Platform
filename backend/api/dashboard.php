<?php
require_once 'config.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['X-Auth-Token'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (!$token) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$decoded = json_decode(base64_decode($token), true);
$userId = $decoded['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Total enrolled courses
    $stmtCourses = $pdo->prepare("SELECT COUNT(*) as total_courses FROM enrollments WHERE student_id = ? AND status = 'Enrolled'");
    $stmtCourses->execute([$userId]);
    $totalCourses = $stmtCourses->fetchColumn();

    // Total study time
    $stmtStudy = $pdo->prepare("SELECT SUM(duration_seconds) as total_seconds FROM study_sessions WHERE student_id = ?");
    $stmtStudy->execute([$userId]);
    $totalSeconds = $stmtStudy->fetchColumn() ?: 0;

    // Upcoming activities (mock for now)
    $upcoming = [];

    // Course completion rate (mock for now)
    $courseCompletionRate = 0;

    echo json_encode([
        "totalCourses" => $totalCourses,
        "totalStudySeconds" => $totalSeconds,
        "upcomingActivities" => $upcoming,
        "courseCompletionRate" => $courseCompletionRate
    ]);
}
?>
