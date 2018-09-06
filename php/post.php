<?php

if(isset($_POST["naam"])){
    $naam = $_POST["naam"];
    echo $naam;
}
if(isset($_POST["vraag"])){
    $vraag = $_POST["vraag"];   
    echo $vraag;
}

if(isset($naam) && isset($vraag)){
$data = array($naam,$vraag,time(),0);

$file = fopen("./vragen.csv","w");
echo($file);
$put = fputcsv($file,$data);
fclose($file);
    echo"POST_OK";
}else{
    echo"niet alle variablen zijn gegeven.";
}
?>