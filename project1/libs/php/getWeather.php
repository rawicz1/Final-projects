<?php


	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$apiKey = "45e32296668beb07f98c5cc60c5aae9b";
	
    $url = 'http://api.openweathermap.org/data/2.5/weather?q=' . $_REQUEST['city'] . '&APPID=' . $apiKey;

   	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	    


	echo json_encode($decode); 

?>