<?php
$url = './countryBorders.geo.json';

$data = file_get_contents($url);
$jsonCountries = json_decode($data, true);

$countryBorders = [];

$code = $_REQUEST['name'];

foreach ($jsonCountries["features"] as $feature) {

    if ($feature["properties"]["name"] == $code) {

        $countryBorders[] = $feature; 
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $countryBorders;

echo json_encode($output);
    ?>