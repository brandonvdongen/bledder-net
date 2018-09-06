<?php
echo "starting";
while(true){
    $output = shell_exec("php -q D:\\Xampp\\htdocs\\sites\\bledder\\socketserver.php");    
    echo  "crash!: ".$output;
    $reboots--;
}
echo "ended";
?>