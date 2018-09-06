<?php
require_once("../auth.php");

$username = mysqli_real_escape_string($conn,$_POST['name']);
$password = mysqli_real_escape_string($conn,$_POST['pass']);
$hash = password_hash($password,PASSWORD_DEFAULT);
$stmt=$conn->prepare("INSERT INTO `users` (`name`, `password`) VALUES (?, ?);");
$stmt->bind_param('ss', $username, $hash);    
$status = $stmt->execute();
$stmt->fetch();
$stmt->close();

$response="CREATE_";
if($status){
    $response .= "OK";
    $_SESSION["login"]=$username;
}
else{
    $response .= "FAILED";
}

echo $response;

?>