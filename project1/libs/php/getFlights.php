<?php


	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);
	
	// $url1 = 'http://api.geonames.org/countryCodeJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=rawiczhub';


	// $url = 'http://opensky-network.org/api/states/all?lamin=45.8389&lomin=5.9962&lamax=47.8229&lomax=10.5226';

	// $url = 'https://opensky-network.org/api/states/all';


    $url = 'https://opensky-network.org/api/states/all?lamin=' . $_REQUEST['lamin'] . '&lomin=' . $_REQUEST['lomin'] . '&lamax=' . $_REQUEST['lamax'] . '&lomax=' . $_REQUEST['lomax'];

    // $url = 'https://opensky-network.org/api/states/all';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	    


	echo json_encode($decode); 

?>