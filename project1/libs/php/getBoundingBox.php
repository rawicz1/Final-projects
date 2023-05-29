<?php
    
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);
	$parser = xml_parser_create();
	
    $url = 'http://api.geonames.org/countryInfo?country=' . $_REQUEST['code'] . '&username=rawiczhub';	   
	
	$xml = simplexml_load_file($url);
	$json = json_encode($xml, JSON_PRETTY_PRINT);
	echo $json;