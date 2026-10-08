<?php
// Set global CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token, X-Session-Email");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '5432';
$db   = getenv('DB_NAME') ?: 'learning_analytics';
$user = getenv('DB_USER') ?: 'postgres';
$pass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '123456';
$charset = 'utf8';

$dsn = "pgsql:host=$host;port=$port;dbname=$db";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    $conn = $pdo; // Alias for backward compatibility
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

define('LAP_AUTH_SECRET', getenv('AUTH_SECRET') ?: 'eduinsight_hmac_secret_2026_key');

function mapCourseIdToDb($id) {
    if (!$id) return null;
    if ($id === 'py-101') return 1;
    if ($id === 'db-101') return 2;
    if ($id === 'wd-101') return 3;
    return (int)$id;
}

function getAuthenticatedTeacher($pdo) {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $xToken = $headers['X-Auth-Token'] ?? $headers['x-auth-token'] ?? $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';

    $token = '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
    } elseif (!empty($xToken)) {
        $token = trim($xToken);
    }

    if (!empty($token) && strpos($token, '.') !== false) {
        list($payloadB64, $sig) = explode('.', $token, 2);
        $expectedSig = hash_hmac('sha256', $payloadB64, LAP_AUTH_SECRET);
        if (hash_equals($expectedSig, $sig)) {
            $payload = json_decode(base64_decode($payloadB64), true);
            if ($payload && isset($payload['user_id'])) {
                $stmt = $pdo->prepare("SELECT user_id, name, email, role FROM users WHERE user_id = :uid AND role = 'Teacher'");
                $stmt->execute([':uid' => (int)$payload['user_id']]);
                $teacher = $stmt->fetch();
                if ($teacher) {
                    return (int)$teacher['user_id'];
                }
            }
        }
    }

    $sessionEmail = $headers['X-Session-Email'] ?? $headers['x-session-email'] ?? $_SERVER['HTTP_X_SESSION_EMAIL'] ?? '';
    if (!empty($sessionEmail)) {
        $stmt = $pdo->prepare("SELECT user_id, name, email, role FROM users WHERE LOWER(email) = LOWER(?) AND role = 'Teacher'");
        $stmt->execute([trim($sessionEmail)]);
        $teacher = $stmt->fetch();
        if ($teacher) {
            return (int)$teacher['user_id'];
        }
    }

    // Default fallback teacher in development (e.g. Dr. Alok Verma)
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE role = 'Teacher' ORDER BY user_id ASC LIMIT 1");
    $stmt->execute();
    $defaultTeacherId = $stmt->fetchColumn();
    if ($defaultTeacherId) {
        return (int)$defaultTeacherId;
    }

    return 2; // Default faculty user_id fallback
}

function getAuthenticatedTeacherInfo($pdo) {
    $teacherId = getAuthenticatedTeacher($pdo);
    $stmt = $pdo->prepare("SELECT user_id, name, email, role, avatar FROM users WHERE user_id = ?");
    $stmt->execute([$teacherId]);
    return $stmt->fetch() ?: [
        'user_id' => $teacherId,
        'name' => 'Dr. Alok Verma',
        'email' => 'alok.verma@college.edu',
        'role' => 'Teacher',
        'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    ];
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}
?>
