<?php 
    require_once("auth.php");
    require_once("functions.php");
    $naam = $_POST["naam"];
    $post = $_POST["post"];
    $stmt=$conn->prepare("INSERT INTO `chat` (`name`, `post`, `date`) VALUES (? , ? , ?);");
    $post = htmlspecialchars($post);
    $naam = htmlspecialchars($naam);
    $stmt->bind_param("sss",$naam,$post,time());
    $stmt->execute();
    $stmt->close();
    echo "SENT";
?>