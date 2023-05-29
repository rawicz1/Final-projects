<?php


	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);	

	$north = $_REQUEST['north'];
	$south = $_REQUEST['south'];
	$east = $_REQUEST['east'];
	$west = $_REQUEST['west'];

    $url = 'http://api.geonames.org/earthquakesJSON?north=' . $north . '&south=' . $south . '&east=' . $east . '&west=' . $west . '&username=rawiczhub';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	    


	echo json_encode($decode); 

?>