<?php 

$headers = getallheaders();
if(strpos($headers['Referer'], 'http://idl.cs.washington.edu/projects/lyra/') !== false) {
  $curl = curl_init($_GET['url']);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

  $result = curl_exec($curl);
  curl_close ($curl);
  echo $result;
} else {
  echo '[{ "error": "Error proxying script, did not originate from a Lyra URL"}]';
}

?>