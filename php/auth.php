<?php session_start();

$user_name = "chat";
$dbpassword = "bledder";
$database_name = "bledder";

$conn = new mysqli('localhost', $user_name, $dbpassword,$database_name);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
 
