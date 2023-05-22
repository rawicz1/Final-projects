	
	// Earthquakes --------------------------------------------------
	
	$('#btnEq').click(function(event) {
		event.preventDefault()
		console.log('from earthquake button')
		$.ajax({
			url: "libs/php/getEarthquakes.php",
			type: 'POST',
			dataType: 'json',
			data: {
				north: $('#north').val(),
				south: $('#south').val(),
				west: $('#west').val(),
				east: $('#east').val(),			
			},
			success: function(result) {
				console.log(result)
				$('#results').empty()
				if (result['earthquakes'].length == 0) {
					$('#results').append('Error: no earthquakes recorder in the area')
				}							
				$.each(result, function (i, article) { 					
					$.each(article, function (j, entry) {				
						$('#results').append('Longitude: ' + entry.lng + '<br/>')
						$('#results').append('Latitude' + entry.lat + '<br/>')
						$('#results').append('Magnitude: ' + entry.magnitude + '<br/>' + '<br/>')
					  })
				  })	
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown)
			}
		}); 
	});

	// Wikipedia ----------------------------------------------------

	$('#btnWiki').click(function(event) {
		event.preventDefault()
		console.log('from button wiki')
		$.ajax({
			url: "libs/php/getWikipedia.php",
			type: 'POST',
			dataType: 'json',
			data: {
				q: $('#term').val(),				
			},
			success: function(result) {	
				console.log(result)
				$.each(result, function (i, article) { 
					$('#results').empty() 
					if (result['data'].length == 0) {
						$('#results').append('Error: no entries found')
					}
					$.each(article, function (j, entry) {						
						$('<img />', {
							src: entry.thumbnailImg,                
						}).appendTo($('#results')) 
						$('#results').append('<br/>')
						$('#results').append(entry.title + '<br/>')
						$('#results').append(entry.summary + '<br/>')
						$('#results').append('Country Code: ' + entry.countryCode + '<br/>' + '<br/>')						
						})
					})				
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown)
			}
		}); 
	});

	// Weather station ----------------------------------------------

	$('#weatherBtn').click(function(e) {
		e.preventDefault()		

		$.ajax({
			url: "libs/php/getWeather.php",
			type: 'POST',
			dataType: 'json',
			data: {
				lat: $('#lat').val(),
				lng: $('#lng').val()		
			},
			success: function(result) {
				console.log(result)
				console.log(result['weatherObservation'])
				$('#results').empty()								
				if (result['status']) {
					$('#results').append('Error: ' + result['status'].message + '<br/>')
				}
				$('#results').append('Station: ' + result['weatherObservation'].stationName + '<br/>')
				$('#results').append('Temperature: ' + result['weatherObservation'].temperature + '<br/>')
				$('#results').append('Wind speed: ' + result['weatherObservation'].windSpeed + '<br/>')
				$('#results').append('Clouds: ' + result['weatherObservation'].clouds + '<br/>')	
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown)
			}
		}); 
	
	});