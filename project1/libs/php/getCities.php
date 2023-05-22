<?php

$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => "https://api.api-ninjas.com/v1/city?min_population=250000&limit=30&country=" . $_REQUEST['country'],
	CURLOPT_RETURNTRANSFER => true,	
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"X-Api-Key: /VqD3qXLegkfkWyaf+Yusg==6JRJAvtK0TYtipSL"
		
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

$decode = json_decode($response,true);   


echo json_encode($decode); 