<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));
$action = $_GET['action'] ?? '';

if ($action === 'register') {
    if (empty($data->name) || empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(["error" => "Name, email, and password are required."]);
        exit;
    }

    $role = $data->role ?? 'Student';
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) RETURNING user_id, name, email, role");
        $stmt->execute([$data->name, $data->email, $password_hash, $role]);
        $user = $stmt->fetch();
        
        if ($role === 'Student') {
            $stmtProfile = $pdo->prepare("INSERT INTO student_profiles (user_id) VALUES (?)");
            $stmtProfile->execute([$user['user_id']]);
        }

        echo json_encode(["message" => "Registration successful", "user" => $user]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["error" => "Registration failed. Email might already exist."]);
    }
} elseif ($action === 'login') {
    if (empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(["error" => "Email and password are required."]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT user_id, name, email, password_hash, role FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    $user = $stmt->fetch();

    if ($user && password_verify($data->password, $user['password_hash'])) {
        unset($user['password_hash']);
        // For simplicity, we are returning user info as token placeholder
        $user['token'] = base64_encode(json_encode(['user_id' => $user['user_id'], 'email' => $user['email']]));
        echo json_encode(["message" => "Login successful", "user" => $user]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid email or password"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid action specified."]);
}
?>
