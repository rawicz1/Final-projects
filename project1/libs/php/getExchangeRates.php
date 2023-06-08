<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);   

	$API_key = '8b2bdf2595e68ea8fae21331';
	$executionStartTime = microtime(true);	 
 
    $url = 'https://v6.exchangerate-api.com/v6/' . $API_key . '/latest/' . $_REQUEST['base'];

   	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$exchangeRates = json_decode($result,true);
	
	$url = './currencies.json';

	$data = file_get_contents($url);
	$currencies = json_decode($data, true);


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['rates'] = $exchangeRates;
	$output['currencies'] = $currencies;

	echo json_encode($output);
	 

?>