<?php
  $filename = $_POST['name'];
  $events   = stripslashes($_POST['events']);

  $file = fopen('logs/' . $filename . '.log.json', "w" );
  if($file == false) {
    echo "Error opening file"; 
    exit();
  }

  fwrite($file, $events);
  fclose($file);
?>