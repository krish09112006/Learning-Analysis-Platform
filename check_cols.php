<?php
require_once "C:/xampp/htdocs/learning-analytics-backend/config/database.php";

try {
    $stmt = $conn->query("DESCRIBE assignments");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
