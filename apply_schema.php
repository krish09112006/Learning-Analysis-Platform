<?php
require 'backend/api/config.php';

$sql = file_get_contents('backend/schema_courses.sql');

try {
    $pdo->exec($sql);
    echo "Schema created successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
