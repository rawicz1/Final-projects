<?php
$url = './countryBorders.geo.json';

$data = file_get_contents($url);
$jsonCountries = json_decode($data, true);

$code = $_REQUEST['name'];
$countryBorders = [];

foreach ($jsonCountries["features"] as $feature) {

    if ($feature["properties"]["name"] == $code) {

        $countryBorders[] = $feature;
        // $countryBorders[] = $feature["iso_a2"];
    }
}


$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $countryBorders;

echo json_encode($output);
    ?>