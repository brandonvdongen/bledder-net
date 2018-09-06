<?php
require_once("../auth.php");

$username = mysqli_real_escape_string($conn,$_POST['name']);
$password = mysqli_real_escape_string($conn,$_POST['pass']);
$hash = password_hash($password,PASSWORD_DEFAULT);
$stmt=$conn->prepare("SELECT `id_user`, `name`, `password` FROM `users` WHERE `name`=?");
$stmt->bind_param('s', $username);    
$stmt->execute();
$stmt->bind_result($id, $name, $datapassword);
$stmt->fetch();
$stmt->close();

$response="LOGIN_";
if(password_verify($password,$datapassword)){
    $response .= "OK";
    $_SESSION["login"]=$name;
}
else{
    $response .= "FAILED";
}

echo $response;

?>