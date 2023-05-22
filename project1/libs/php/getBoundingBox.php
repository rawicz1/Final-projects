<?php
    $url = './boundingBoxes.json';

    $data = file_get_contents($url);
    $jsonBoundingBoxes = json_decode($data, true);

    $request = $_REQUEST['code'];

    $boundingBox;

    foreach ($jsonBoundingBoxes as $key => $value) {
    
        if ($key == $request){            
            $boundingBox[] = $value[1];
        };
    };

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['data'] = $boundingBox;

    echo json_encode($output);
