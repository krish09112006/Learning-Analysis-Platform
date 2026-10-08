<?php
require_once 'config.php';

// Simple token parsing (replace with proper JWT verification in production)
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
    $stmt = $pdo->prepare("
        SELECT u.name, u.email, sp.branch, sp.semester, sp.avatar_url 
        FROM users u 
        LEFT JOIN student_profiles sp ON u.user_id = sp.user_id 
        WHERE u.user_id = ?
    ");
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    
    echo json_encode($profile);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    $branch = $data->branch ?? null;
    $semester = $data->semester ?? null;
    
    // Update user name
    if (!empty($data->name)) {
        $stmtUser = $pdo->prepare("UPDATE users SET name = ? WHERE user_id = ?");
        $stmtUser->execute([$data->name, $userId]);
    }

    // Update profile
    $stmtProfile = $pdo->prepare("
        INSERT INTO student_profiles (user_id, branch, semester) 
        VALUES (?, ?, ?) 
        ON CONFLICT (user_id) DO UPDATE 
        SET branch = EXCLUDED.branch, semester = EXCLUDED.semester
    ");
    // PostgreSQL doesn't support ON CONFLICT unless we add a UNIQUE constraint, let's just do update
    // Actually, user_id is unique because it's 1-to-1. But let's write an UPDATE query instead assuming profile exists.
    
    $stmtUpdate = $pdo->prepare("UPDATE student_profiles SET branch = ?, semester = ? WHERE user_id = ?");
    $stmtUpdate->execute([$branch, $semester, $userId]);
    
    echo json_encode(["message" => "Profile updated successfully"]);
}
?>
