<?php
$url = './countryBorders.geo.json';

$data = file_get_contents($url);
$jsonCountries = json_decode($data, true);

$countries = [];

foreach ($jsonCountries["features"] as $feature) {
    $country = [
        "name" => $feature["properties"]["name"],
        "code" => $feature["properties"]["iso_a2"],
		"geometry" => $feature["geometry"]
    ];
    $countries[] = $country;
}

sort($countries);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $countries;

echo json_encode($output);
    ?>