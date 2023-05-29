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
      },3000)
  }
}

// initiate leaflet map ----------------------------------------------------------------------------------------------------------

const map = L.map('map').setView([53, 0], 10)

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
let bordersGroup = L.featureGroup([])
let marker
let markers


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


// leaflet easybuttons ------------------------------------------------------------------------------------------------------------------------------------


// country information modal -----------------------------------------------------------------------------------------------------------------------------

let showCountryInfo = L.easyButton('<img src="./images/info.png" class="easy-button-icon" style="width:100%" alt="info">', function(btn, map){
   currency.length = 0
    $(document).ready(function(value){
        
        $("#languages").empty()        
        const languages = countryInfo[0].languages              
        
        $("h1").empty().append(userCountry)
        $("#official_name").empty().append(countryInfo[0].official_name)
        $("#capital").empty().append(countryInfo[0].capital)
        $("#population").empty().append(countryInfo[0].population)
        $("#call_code").empty().append(countryInfo[0].callingCode)  
        
        for (let [key, language] of Object.entries(languages)) {
                $("#languages").append(language, ' ')
        }
       
        const source = "https://flagcdn.com/" + userCountryCode[0].toLowerCase() +".svg"
        $("#country-flag").attr("src", source)          
   
        $("#modal").modal('show')
      })
}, 'Show country info', 'button')

showCountryInfo.addTo(map)



// country wikipedia info modal -------------------------------------------------------------------------------------------------------------------------

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


// currency modal ----------------------------------------------------------------------------------------------------------------------------------------

let showCurrency = L.easyButton('<img id="toggle-weather" src="./images/currency.png" class="easy-button-icon"  alt="currency">', function(btn, map){
    
     $(document).ready(function(value){
        
        currency.length = 0
        $("#languages").empty()
        $("#base-currency").empty()
        $("h1").empty().append(userCountry) 
        const currencies = countryInfo[0].currencies    
 
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
        
        $.ajax({
            url: "libs/php/getExchangeRates.php",            
            type: 'POST',
            dataType: 'json',
            data: {
                base: currency[0]
            },        
            success: function(result) {         
            console.log(result)
            Object.keys(result.conversion_rates).forEach(function eachKey(key){                  
                $('#currency-select').append('<option value="'+key+'">'+key+'</option>')
            })               
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
            }
        })
        $("#modal-currency").modal('show')
       })
 }, 'Show currency info', 'button')
 
 showCurrency.addTo(map)

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

// country top headlines modal-------------------------------------------------------------------------------------------------------

let showNews = L.easyButton('<img src="./images/news-icon.png" id="toggle-weather" class="easy-button-icon" alt="city">', function(btn, map){
    
    $(document).ready(function(){
       
        $.ajax({
            url: "libs/php/getNews.php",
            type: 'GET',
            dataType: 'json',
            data: {
                country: userCountryCode[0]
            },        
            success: function(result) {  

                for (let i = 0; i < result.articles.length; i++){                    
                    let newsID = "#news" + i
                    let link = result.articles[i]['link']
                    $(newsID).html(result.articles[i]['author'] + '<br>' + '<a target="_blank" href="' + link + '">'+ '<b>' + result.articles[i]['title'] +'</b>' + '<br>'  + '</a>'+ 'Click on the title to find out more' + '<hr>')
                }
                $("#news-modal").modal('show')
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
            }
        })
        })
}, 'Show news', 'button')

showNews.addTo(map)


// how to say hello in other countries modal ----------------------------------------------------------------------------------------

let showHello = L.easyButton('<img src="./images/hello.jpg" id="toggle-weather" class="easy-button-icon" alt="city">', function(btn, map){
    // $("#news-body").empty()
    $(document).ready(function(){
       
        $.ajax({
            url: "libs/php/getHello.php",
            type: 'GET',
            dataType: 'json',
            data: {
                country: userCountryCode[0]
            },        
            success: function(result) {                   
                $("#hello-language").empty().append(Object.values(countryInfo[0].languages)[0])                 
                $("#hello-translation").empty().append(Object.values(result)[1])               
                $("#hello-modal").modal('show')
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
                }
            })
        })
}, 'Show hello', 'button')

showHello.addTo(map)


// helpers -------------------------------------------------------------------------------------------------------------------------

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
            boundingBox.push(result['country']['east'])
            boundingBox.push(result['country']['west'])   
            boundingBox.push(result['country']['north'])   
            boundingBox.push(result['country']['south'])                     
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    }); 

}

// get country from select dropdown menu ------------------------------------------------------------------------------------------

function selectCountry(value) {
    bordersGroup.clearLayers()
    countryInfo.length = 0
    userCountry.length = 0
    const options = document.querySelectorAll('#currency-select option');
    for (let i = 0; i < options.length; i++) {
    options[i].selected = options[i].defaultSelected;
    }
    $.ajax({
        url: "libs/php/getUserCountryBorders.php",
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


// get country borders from file --------------------------------------------------------------------------------------------------

function getUserCountryBorders(value) {
    map.closePopup()
    
    $.ajax({
        url: "libs/php/getUserCountryBorders.php",
        type: 'POST',
        dataType: 'json',
        data: {
            name: userCountry[0] 
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

            getChosenCountryInfo()
            setTimeout(function(){
                getEarthquakes()
                getPlanes()
                getISS()
            }, 2000)          
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, errorThrown)
        }
    })
}

function getChosenCountryInfo() {
   
    let countryName = userCountry[0].replace(" ", "%20")
   
    $.ajax({
        url: "libs/php/getUserCountryInfo.php",
        type: 'POST',
        dataType: 'json', 
        data: {
            name: countryName
        },              
        success: function(result) {                           
          for (let [key, value] of Object.entries(result)) {
            console.log(value)
            countryInfo.push(value)
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, errorThrown)
        }
    }); 
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


// leaflet layer control -----------------------------------------------------------------------------------------------------------


const streetMap= L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)
const topographicMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// ISS layer control ---------------------------------------------------------------------------------------------------------------

const iconISS = L.icon({
    iconUrl: './images/ISS_icon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [-3, -76],    
})

let ISS = L.layerGroup();

function getISS() {
   
        if (ISS) {
            ISS.clearLayers()
            }
        $.ajax({
            url: "libs/php/getISSPosition.php",
            type: 'POST',
            dataType: 'json',    
            
            success: function(result) {  
                const { latitude, longitude } = result            
                let markerISS = L.marker([latitude, longitude], {icon: iconISS}).bindPopup('The current location of the International Space Station.').openPopup()           
                ISS.addLayer(markerISS)               
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
            }
        });
    }


// Air traffic layer control -------------------------------------------------------------------------------------------------------

const planeIcon = new L.Icon({
    iconUrl: './images/airplane.svg',   
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

let planeGruop = L.layerGroup()

function getPlanes() {

    if (planeGruop) {
        planeGruop.clearLayers()
        }
    $.ajax({
        url: "libs/php/getFlights.php",
        type: 'POST',
        dataType: 'json',
        data: {     
        lomin: boundingBox[1],
                    lamin: boundingBox[3],
                    lomax: boundingBox[0],
                    lamax: boundingBox[2]           
        }, 
        success: function(result) {     
        
        markers = L.markerClusterGroup({
                    polygonOptions: {
                        fillColor: "blue",
                        color: "blue",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.5,
                    },
                })
                for (let i=0; i<result.states.length; i++) {
                        const latLng = [result.states[i][6], result.states[i][5]]
                        let planeMarker = L.marker(latLng, {icon: planeIcon}).bindPopup('Flight ' + result.states[i][1] + ' from ' + result.states[i][2] + '<br>' + 'Velocity: ' + Math.round((result.states[i][9])*2.236) + ' mph' + '<br>' + 'Altitude: ' + result.states[i][13] + ' m')
                        markers.addLayer(planeMarker)
                        planeGruop.addLayer(markers)
                    } 
            },
            error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
            }
            })
}

// Earthquakes layer control ------------------------------------------------------------------------------------------------------

const greenIcon = new L.Icon({
                    iconUrl: './images/greenIcon.png',
                    shadowUrl: './images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })

let earthquakeGruop = L.layerGroup();

function getEarthquakes() {
    
    if (earthquakeGruop) {
        earthquakeGruop.clearLayers()
    }

    $.ajax({
        url: "libs/php/getEarthquakes.php",
        type: 'POST',
        dataType: 'json',
        data: {     
            west: boundingBox[1],
            south: boundingBox[3],
            east: boundingBox[0],
            north: boundingBox[2]          
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
                        })

            for (let i = 0; i < result.earthquakes.length; i++) {
                const latLng = [result.earthquakes[i].lat, result.earthquakes[i].lng]
                         
                let earthquakeMarker = L.marker(latLng, {icon: greenIcon})
                earthquakeMarker.bindPopup(result.earthquakes[i]['datetime'] + '<br>' + 'Magnitude: ' + result.earthquakes[i]['magnitude'] )
                markers.addLayer(earthquakeMarker)
                earthquakeGruop.addLayer(markers) 
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    })
}

const baseMaps = {
    'Street map': streetMap,
    'Topographic map': topographicMap 
}

const overlayMaps = {    
    "Earthquakes": earthquakeGruop,
    "Air traffic": planeGruop,
    "ISS position": ISS
}

const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map)
