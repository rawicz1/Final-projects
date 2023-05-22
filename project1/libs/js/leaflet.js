// handle spinner and on document load ------------------------------------------------------------------------------------------

document.onreadystatechange = function () {
  var state = document.readyState
  if (state == 'interactive') {
       document.getElementById('contents').style.visibility="hidden"
  } else if (state == 'complete') {
      setTimeout(function(){
         document.getElementById('interactive')
         document.getElementById('load').style.visibility="hidden"
         document.getElementById('contents').style.visibility="visible"
      },2000)
  }
}

// initiate leaflet map ----------------------------------------------------------------------------------------------------------

const map = L.map('map').setView([53, 0], 10)

const OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
OpenStreetMap_Mapnik.addTo(map)

// handle change street / topographic map --------------------------------------------------------------------------------------

function changeMap()
{   
    if (document.getElementById('button').textContent == 'Topographic Map') {
        var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	    maxZoom: 10,
	    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    OpenTopoMap.addTo(map)
    document.getElementById('button').textContent = 'Street Map'   
    }
    else if (document.getElementById('button').textContent == 'Street Map') {
        const OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    maxZoom: 19,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        OpenStreetMap_Mapnik.addTo(map)
        document.getElementById('button').textContent = 'Topographic Map'
    }
}

let marker

navigator.geolocation.getCurrentPosition(success, error)

let userPosition = [] // user lat lng
let userCountryCode = [] // iso 2 code
let userCountry = [] // country name
let countryInfo = [] // country info from countryAPI
let wikiCountryLink = [] // 
let currency = [] // currency from countryAPI
let boundingBox = [] // country's bounding box to show flights data
const selectCountries = document.getElementById("countries") // to hide select and show description
const description = document.getElementById('description')
const weatherApiKey = "45e32296668beb07f98c5cc60c5aae9b"
let markers

let bordersGroup = L.featureGroup([])


var settingsCountryApi = {
    "url": "https://countryapi.io/api/all/",
    "method": "GET",
    "timeout": 0,
    "headers": {
      "Authorization": "Bearer OS9Pv2GgpLE3hVX9ZCCdC4OMLIpOPPyDmOCP4BDO" //solstheim
    },
  };   

function success(pos) {
    const lat = pos.coords.latitude
    userPosition.push(lat)   
    const lng = pos.coords.longitude   
    userPosition.push(lng)
   
    var violetIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

    if (marker) {
        map.removeLayer(marker)      
    } 

    marker = L.marker([lat, lng], {icon: violetIcon}).addTo(map).bindPopup('Your location').openPopup()
    map.setView([lat, lng]);
    
    getUserCountry()    
}

function error(err) {
    if (err.code === 1) {
        alert("Please allow geolocation access");
    } else {
        alert("Cannot get current location");
    }
}

// change street / topographic map button -----------------------------------------------------------------------------------------

const toggleMap = L.easyButton({
    id: 'toggle-map',
    
    states: [{
        icon: '<img src="./images/mountain.png" class="easy-button-icon" style="width:100%" alt="toggle-map">',
        stateName: 'mountains',
        onClick: function(btn,map) {
            const OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	            maxZoom: 10,
	            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                });
            OpenTopoMap.addTo(map)
            btn.state('map')
        }
    }, {
        icon: 'fa-map',
        stateName: 'map',
        onClick: function(btn,map) {
            btn.state('mountains')
            const OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	            maxZoom: 19,
	            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                });
            OpenStreetMap_Mapnik.addTo(map)
        }
    }], 
});
toggleMap.addTo(map)

// show earthquakes button --------------------------------------------------------------------------------------------------------

const toggleEarthquakes = L.easyButton({
    id: 'toggle-earthquakes',    
    states: [{
        icon: '<img src="./images/earthquake.png" class="easy-button-icon" style="width:100%" alt="earthquakes">',
        stateName: 'mountains',
        onClick: function(btn,map) {
            var popup = L.popup()
                .setLatLng(userPosition)
                .setContent('<p>Earthquakes from the last 24h</p>')
                .openOn(map)
            getEarthquakes() 
            btn.state('map')
        }
    }, {
        icon: 'fa-map',
        stateName: 'map',
        onClick: function(btn,map) {
            btn.state('mountains')
            getUserCountryBorders()
        }
    }], 
})
toggleEarthquakes.addTo(map)


// show current ISS position --------------------------button ----------------------------------------------------------------------

const toggleISS = L.easyButton({
    id: 'toggle-map',
    
    states: [{
        icon: '<img src="./images/ISS-Logo.png" class="easy-button-icon" style="width:110%" alt="ISS">',
        stateName: 'ISS',
        onClick: function(btn,map) {
            getISSPosition()
            btn.state('x-mark')
        }
    }, {
        icon: 'fa-close',
        stateName: 'x-mark',
        onClick: function(btn,map) {
            btn.state('ISS')
            window.location.reload()
        }
    }], 
});

toggleISS.addTo(map)

//ISS icon 

const myIcon = L.icon({
    iconUrl: './images/ISS_icon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [-3, -76],    
})

// show cities with population above 250.000 ------------------------------------------------------------------------------------

const toggleCities = L.easyButton({
    id: 'toggle-cities',
    
    states: [{
        icon: '<img src="./images/city.png" class="easy-button-icon" style="width:100%" alt="city">',
        stateName: 'off',
        onClick: function(btn,map) {
            getCities()
            selectCountries.style.display= "none"
            description.style.display = "block"
            description.innerHTML = "Showing cities with population over 250.000. Click X for more options"

            btn.state('x-mark');
        }
    }, {
        icon: 'fa-close',
        stateName: 'x-mark',
        onClick: function(btn,map) {
            btn.state('off')
            window.location.reload()
        }
    }], 
});

toggleCities.addTo(map);

function getCities(){            
    if (markers){
        markers.clearLayers()
    }
    
    $.ajax({
        url: "libs/php/getCities.php",
        type: 'POST',
        dataType: 'json',
        data: {     
            country: countryInfo[0].alpha2Code
        },        
        success: function(result) {                             
            
            markers = L.markerClusterGroup({
                polygonOptions: {
                  fillColor: "black",
                  color: "#000",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.5,
                },
              }).addTo(map)

              var greenIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })

            for (let i=0; i<result.length; i++) {
                const latLng = [result[i].latitude, result[i].longitude]
                let cityMarker = L.marker(latLng, {icon: greenIcon}).bindPopup(result[i].name + ', population: ' + result[i].population )
                 markers.addLayer(cityMarker)
            } 
           markers.addTo(map)
       
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    })       
}

// get live flights data from Open Sky Network --------------------------------------------------------------------------------

const showFlights = L.easyButton({
    id: 'toggle-map',
    
    states: [{
        icon: '<img src="./images/plane.jpg" class="easy-button-icon" style="width:95%" alt="show-flights">',
        stateName: 'off',
        onClick: function(btn,map) {
            getFlights()
            // const selectCountries = document.getElementById("countries")
            selectCountries.style.display= "none"
            description.style.display = "block"
            description.innerHTML = "Displaying planes currently flying over the chosen country's area. "
            btn.state('x-mark')
        }
    }, {
        icon: 'fa-close',
        stateName: 'x-mark',
        onClick: function(btn,map) {
            btn.state('off')
            window.location.reload()
        }
    }], 
})

showFlights.addTo(map)

function getBoundingBox() {
   
    $.ajax({
        url: "libs/php/getBoundingBox.php",
        type: 'POST',
        dataType: 'json',
        data: {
           code: userCountryCode[0]
        },        
        success: function(result) {         
            boundingBox.length = 0
            boundingBox.push(result['data'][0])             
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    }); 

}

function getFlights(){  
    
    if (markers){
        markers.clearLayers()
    }   
    $.ajax({
        url: "libs/php/getFlights.php",
        type: 'POST',
        dataType: 'json',
        data: {     
            lomin: boundingBox[0][0],
            lamin: boundingBox[0][1],
            lomax: boundingBox[0][2],
            lamax: boundingBox[0][3]            
        },        
        success: function(result) {     
           
            markers = L.markerClusterGroup({
                polygonOptions: {
                  fillColor: "green",
                  color: "green",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.5,
                },
              }).addTo(map)

              var greenIcon = new L.Icon({
                iconUrl: './images/airplane.svg',
                // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
            for (let i=0; i<result.states.length; i++) {
                const latLng = [result.states[i][6], result.states[i][5]]
                let planeMarker = L.marker(latLng, {icon: greenIcon}).bindPopup('Flight ' + result.states[i][1] + ' from ' + result.states[i][2] + '<br>' + 'Velocity: ' + Math.round((result.states[i][9])*2.236) + ' mph' + '<br>' + 'Altitude: ' + result.states[i][13] + ' m'  )
                 markers.addLayer(planeMarker)
            } 
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    })       
}


// country info modal ----------------------------------------------------------------------------------------------------------

let showCountryInfo = L.easyButton('<img src="./images/info.png" class="easy-button-icon" style="width:100%" alt="info">', function(btn, map){
   currency.length = 0
    $(document).ready(function(value){
        
        $("#languages").empty()
        $("#base-currency").empty()
        const languages = countryInfo[0].languages
        const currencies = countryInfo[0].currencies        
        
        $("h1").empty().append(userCountry)
        $("#official_name").empty().append(countryInfo[0].official_name)
        $("#capital").empty().append(countryInfo[0].capital)
        $("#population").empty().append(countryInfo[0].population)
        $("#call_code").empty().append(countryInfo[0].callingCode)  
        
        for (let [key, language] of Object.entries(languages)) {
                $("#languages").append(language, ' ')
        }

        function getCurrencyDetails (currencyObject) {
                for (const key in currencyObject) {
                    $("#currency").empty().append(key)                    
                    currency.push(key)
                    $("#base-currency").empty().append(currency[0])                    
                    if (typeof currencyObject[key] === 'object') {
                        for (const nested in currencyObject[key]) {
                            $("#currency-name").empty().append(currencyObject[key]['name'])
                            $("#currency-symbol").empty().append(currencyObject[key]['symbol'])                        
                        }
                    } 
                }   
        }

        getCurrencyDetails(currencies)
       
        const source = "https://flagcdn.com/" + userCountryCode[0].toLowerCase() +".svg"
        $("#country-flag").attr("src", source)  
        
        $.ajax({
            url: "libs/php/getExchangeRates.php",            
            type: 'POST',
            dataType: 'json',
            data: {
                base: currency[0]
            },        
            success: function(result) {         
                    
                Object.keys(result.conversion_rates).forEach(function eachKey(key){                  
                    $('#currency-select').append('<option value="'+key+'">'+key+'</option>')
                })               
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
            }
        })
        $("#modal").modal('show')
      })
}, 'Show country info', 'button')

showCountryInfo.addTo(map)

function getExchangeRate(value){         
        
            $.ajax({
                url: "libs/php/getExchangeRates.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    base: currency[0]
                },        
                success: function(result) {                             

                    Object.keys(result.conversion_rates).
                    forEach(function eachKey(key){
                        if (key === value){                                 
                            $("#currency-to-calculate").empty().append((result.conversion_rates[key]).toFixed(2))      
                        }
                   })
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown)
                }
            })       
        }

// country wikipedia info modal ------------------------------------------------------------------------------------------------

let showWikiInfo = L.easyButton('<img id="wiki-icon"  src="./images/wiki.png" style="width:120%">', function(btn, map){
    wikiCountryLink.length = 0
    $(document).ready(function(){
        
        const userCJoin = userCountry[0].replace(/\s/g, "-")
        
        $.ajax({
            url: "libs/php/getWikiInfo.php",
            type: 'POST',
            dataType: 'json',
            data: {
                country: userCJoin,
                
            },        
            success: function(result) {    
                
                wikiCountryLink.push(result.geonames[0].wikipediaUrl)
                $("#wiki-title").empty().append(result.geonames[0].title)
                $("#wiki-summary").empty().append(result.geonames[0].summary)                

            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
            }
        })    
                 
        $("#modal-wiki").modal('show')
        
      })
}, 'Show wiki info', 'button')

showWikiInfo.addTo(map)

function openWikiPage() {    
    window.open('https://' + wikiCountryLink[0])
}

// show weather modal -------------------------------------------------------------------------------------------------------------

let showWeather = L.easyButton('<img src="./images/weather.jpg" id="toggle-weather" class="easy-button-icon" alt="city">', function(btn, map){
    $("#weather-country").empty()
    $(document).ready(function(){
       
        $.ajax({
            url: "libs/php/getWeather.php",
            type: 'POST',
            dataType: 'json',
            data: {
                city: countryInfo[0]['capital'],
                // APPID: weatherApiKey
            },        
            success: function(result) {         
               
                const iconCode = result.weather[0].icon
                const iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png"
                $("#weather-country").empty().append(userCountry)
                $("#weather-capital").empty().append(countryInfo[0]['capital'])   
                $('#weather-icon').attr('src', iconUrl)
                $("#weather-main").empty().append(result.weather[0]['main'])
                $("#weather-description").empty().append(result.weather[0]['description'])  
                $("#icon-temp").empty().append(Math.round(result.main['temp'] - 273.15).toFixed(1) + ' °C')
                $("#weather-wind").empty().append(result.wind['speed'] + ' mph')
                $("#weather-humidity").empty().append(result.main['humidity'] + ' %')
                $("#weather-pressure").empty().append(result.main['pressure'] + ' hPa')
                $("#weather-modal").modal('show')
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
            }
        })
        })
}, 'Show weather info', 'button')

showWeather.addTo(map)

// weather forecast modal --------------------------------------------------------------------------------------------------------

const weatherForecast = function() {
   $("#forecast-day").empty()
    $.ajax({
        url: "libs/php/getWeatherForecast.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: countryInfo[0]['latLng']['capital'][0],
            lng: countryInfo[0]['latLng']['capital'][1],
            APPID: weatherApiKey
        },        
        success: function(result) {      
            
            $("#forecast-city").empty().append(countryInfo[0]['capital'] + ', ' + userCountry)
            const $div = $("<h4></h4>", {id: "day-test"})            
            
            for (let i = 0; i<result.list.length; i=i+8 ){   
                const iconCode = result.list[i].weather[0].icon
                const iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png"
              
                $("#forecast-day").clone().append($div.text((result.list[i].dt_txt).slice(0, -8) + ' ')).append('<img src=' + "http://openweathermap.org/img/w/" + iconCode + ".png" + '>')
                $div.clone().appendTo($("#forecast-day")).append('<img src=' + "http://openweathermap.org/img/w/" + iconCode + ".png" + '>')
                .append( '<p style="font-size:smaller; font-weight:normal" >' + (Math.round(result.list[i].main.temp - 273.15) + '°C ')  +
                ', ' + result.list[i].weather[0].main + ' - '+ result.list[i].weather[0].description + '</p>')
            }  
            $("#weather-forecast").modal('show')
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    })
}

// get country from select dropdown menu ------------------------------------------------------------------------------------------


function selectCountry(value) {
    bordersGroup.clearLayers()
    countryInfo.length = 0
    userCountry.length = 0
    $.ajax({
        url: "libs/php/selectCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
           	name: value
        },        
        success: function(result) {        
           
            userCountryCode.length = 0
            userCountryCode.push(result['data'][0]['properties']['iso_a2'])
            userCountry.push(result['data'][0]['properties']['name'])              
            
            getUserCountryBorders()
            getBoundingBox()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    })
}

// get user's country code based on lat/lng ---------------------------------------------------------------------------------------

function getUserCountry() {
    $.ajax({
        url: "libs/php/getUserCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
           	lat: userPosition[0],
            lng: userPosition[1]
        },        
        success: function(result) {           
            userCountryCode.push(result.countryCode)
            userCountry.push(result.countryName)
            
            getUserCountryBorders()
            getBoundingBox()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    }); 
}

// get country borders from file --------------------------------------------------------------------------------------------------

function getUserCountryBorders() {
    map.closePopup()
    if (map.hasLayer(earthquakes)) {
        map.removeLayer(earthquakes);
    }
    
    $.ajax({
        url: "libs/php/getUserCountryBorders.php",
        type: 'POST',
        dataType: 'json',
        data: {
            code: userCountryCode[0]
        },           
        success: function(result) {
            bordersGroup.clearLayers()           
            const myStyle = {
                "color": "#5a6bfc",
                "weight": 2,
                "opacity": 0.65
            };
            L.geoJSON(result['data'], {
                style: myStyle
            }).addTo(bordersGroup)

            bordersGroup.addTo(map)
            map.fitBounds(bordersGroup.getBounds())           

            $.ajax(settingsCountryApi).done(function (response) {
                const codeLower = userCountryCode[0].toLowerCase()
                countryInfo.push(response[codeLower])                

              })

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, errorThrown)
        }
    })
}

// get list of countries to fill select dropdown menu ----------------------------------------------------------------------------------
function getCountries() {
    $.ajax({
        url: "libs/php/getCountries.php",
        type: 'GET',
        dataType: 'json',              
        success: function(result) {                   
            result['data'].forEach(function(feature){               
                $('#countries').append('<option value="'+feature.name+'">'+feature.name+'</option>')
            })
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, errorThrown)
        }
    }); 
}
getCountries()

// ISS position ----------------------------------------------------------------------------------------------------------------

function getISSPosition() {
    $.ajax({
        url: "libs/php/getISSPosition.php",
        type: 'POST',
        dataType: 'json',     
        
        success: function(result) {            
            
            const { latitude, longitude } = result            
           	L.marker([latitude, longitude], {icon: myIcon}).addTo(map).bindPopup('The current location of the International Space Station.').openPopup()           
            map.setView([latitude, longitude], 3) 
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    }); 
}

// earthquakes button ----------------------------------------------------------------------------------------------------------

const earthquakes = L.featureGroup([])

function getEarthquakes(e) {   
    
    $.ajax({
        url: "libs/php/getEarthquakes.php",
        type: 'GET',
        dataType: 'json',
                
        success: function(result) {         
           
            let features  = []
            features.length = 0
            
            let geoJson = L.geoJSON(result, {
                style: function(feature) {
                    return {
                        fillOpacity: 0.3,
                        // opacity: 0.3,
                        weight: 0.5
                    }
                },
                pointToLayer: function(geoJsonPoint, latlng) {
                    return L.circle(latlng, 50000*(geoJsonPoint.properties.mag))
                }
            }).addTo(earthquakes)
            earthquakes.addTo(map)
            map.fitBounds(earthquakes.getBounds())     
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    })}

 