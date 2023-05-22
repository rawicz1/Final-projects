<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

    // $APP_ID = 'e50f94d326ef43a4bf6f8da97d51d720'; openexchangerates.org 

	$API_key = '8b2bdf2595e68ea8fae21331';
	$executionStartTime = microtime(true);
	 
 
    $url = 'https://v6.exchangerate-api.com/v6/' . $API_key . '/latest/' . $_REQUEST['base'];

    // $url = 'https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=5&gsrsearch=' . $_REQUEST['country'];

    // $url = 'http://en.wikipedia.org/w/api.php?action=query&prop=info&pageids=31717&inprop=url';

   	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	    



    

	echo json_encode($decode); 

?>