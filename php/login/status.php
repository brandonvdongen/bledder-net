<?php
session_start();

if(isset($_SESSION["login"])){
    echo "LOGGED_IN|".$_SESSION["login"]."|";
    if(isset($_SESSION["userUUID"])){
        echo $_SESSION["userUUID"]."";
    }
    if(isset($_SESSION["linkUUID"])){
        echo $_SESSION["linkUUID"]."";
    }
}
else{echo "NOT_LOGGED_IN";}
?>