<?php


$curl = curl_init();

// monthly limit 50 api calls

curl_setopt_array($curl, [
	CURLOPT_URL => 'https://api.newscatcherapi.com/v2/latest_headlines?page_size=5&countries=' . $_REQUEST['country'],
	CURLOPT_RETURNTRANSFER => true,	
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
	
		'x-api-key: iM85nnXiZiSqKhyaXmcUhVVU_8fFEAQz-TjQ4Pv2LZo'	
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

$decode = json_decode($response,true);   


echo json_encode($decode); 


?>