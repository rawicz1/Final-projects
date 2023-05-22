<?php
$url = './countryBorders.geo.json';

$data = file_get_contents($url);
$jsonCountries = json_decode($data, true);

$code = $_REQUEST['code'];
$countryBorders = [];

foreach ($jsonCountries["features"] as $feature) {

    if ($feature["properties"]["iso_a2"] == $code) {

        $countryBorders[] = $feature["geometry"];
    }
}


$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $countryBorders;

echo json_encode($output);
    ?>