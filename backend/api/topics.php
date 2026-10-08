<?php
require 'config.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['course_id'])) {
        $stmt = $pdo->prepare("SELECT * FROM course_topics JOIN course_modules ON course_topics.module_id = course_modules.module_id WHERE course_id = ? ORDER BY course_modules.order_index ASC, course_topics.order_index ASC");
        $stmt->execute([$_GET['course_id']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['action']) && $data['action'] === 'reorder') {
        // Implementation for reorder
        echo json_encode(["status" => "success"]);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO course_topics (module_id, title, content, code_example, order_index) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$data['module_id'], $data['title'], $data['content'] ?? '', $data['code_example'] ?? '', $data['order_index'] ?? 0]);
    echo json_encode(["status" => "success"]);
    exit;
}
?>
