<?php 
    $fetchid = $_POST["fetchid"];
    require_once("auth.php");
    require_once("functions.php");
    $stmt=$conn->prepare("SELECT `id`, `name`, `post`, `date` FROM `chat` WHERE `id`>? AND `date`>?  ORDER BY `date` ASC LIMIT 50");
    $time = time()-(60*60*24);
    $stmt->bind_param("ss",$fetchid,$time);
    $stmt->execute();
    $stmt->bind_result($id,$name,$post,$date);
    $stmt->store_result();
    $namelist = "";
    $output = "";
    if($stmt->num_rows()>=1){
        while($stmt->fetch()){
                $namelist .= $id."|".$name."|".$post."|".$date."<|>";
        }
        $output .= $namelist; 
    }
    print($output);
    $output="";
    $stmt->close();
?>