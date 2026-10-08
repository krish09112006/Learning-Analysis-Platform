<?php
require 'config.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode([]);
    exit;
}
if ($method === 'POST') {
    echo json_encode(["status" => "success"]);
    exit;
}
?>
