<?php


$name = $_REQUEST['name'];

$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => "https://countryapi.io/api/name/" . $name,
	CURLOPT_RETURNTRANSFER => true,	
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		
        "Authorization: Bearer jNCQJbgz15IAHHVgHGyetZVNEtrFzg0329sZDlfi" 
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

$decode = json_decode($response,true);   


echo json_encode($decode); 