<?php
require 'backend/api/config.php';
echo "Connected successfully to " . $db . "\n";
$tables = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")->fetchAll(PDO::FETCH_COLUMN);
echo "Tables in database:\n";
foreach ($tables as $t) {
    echo " - " . $t . "\n";
}
