<?php

$headers = getallheaders();
$url = $_GET['url'];

if(strpos($headers['Referer'], 'http://idl.cs.washington.edu/projects/lyra/') === false) {
  echo '[{ "error": "Error proxying script, did not originate from a Lyra URL" }]';
  return;
}

if(strpos(parse_url($url)['scheme'], 'http') === false) {
  echo '[{ "error": "We only support data found at a http(s) URL." }]';
  return;
}

$curl = curl_init($_GET['url']);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

$result = curl_exec($curl);
curl_close ($curl);
echo $result;

?>
