<?php 

$headers = getallheaders();
if(strpos($headers['Referer'], 'http://idl.cs.washington.edu/projects/lyra/') !== false) {
  $curl = curl_init($_GET['url']);
  echo curl_exec($curl);
} else {
  echo '[{ "error": "Error proxying script, did not originate from a Lyra URL"}]';
}

?>