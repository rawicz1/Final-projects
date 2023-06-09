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
let userCountryCode = [] // iso 2 code from geonames API
let userCountry = [] // country name from geonames API
let countryInfo = [] // country info from countryAPI
let wikiCountryLink = [] // 
let currency = [] // currency from countryAPI
let boundingBox = [] // country's bounding box to show flights data

let bordersGroup = L.featureGroup([])

let markers


function success(pos) {
    const lat = pos.coords.latitude
    userPosition.push(lat)   
    const lng = pos.coords.longitude   
    userPosition.push(lng)   

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

let showCountryInfo = L.easyButton('fa-info', function(btn, map){
   currency.length = 0
    $(document).ready(function(value){
        
        $("#languages").empty()        
        const languages = countryInfo[0].languages              
        
        $("h1").empty().append(userCountry)
        $("#official_name").empty().append(countryInfo[0].official_name)
        $("#capital").empty().append(countryInfo[0].capital)
        $("#population").empty().append(numeral(countryInfo[0].population).format("0,0"))
        $("#call_code").empty().append(countryInfo[0].callingCode)  
        for (let [key, language] of Object.entries(languages)) {
                $("#languages").append(language, ' ')
            }               
        const source = "https://flagcdn.com/" + $('#countries').val().toLowerCase() +".svg"
        $("#country-flag").attr("src", source)          
   
        $("#modal").modal('show')
      })
}, 'Show country info', 'button')

showCountryInfo.addTo(map)



// country wikipedia info modal -------------------------------------------------------------------------------------------------------------------------

let showWikiInfo = L.easyButton('fa-brands fa-wikipedia-w', function(btn, map){
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

let showCurrency = L.easyButton('fa-solid fa-money-bill-1-wave', function(btn, map){
    
     $(document).ready(function(value){
        
        currency.length = 0
        $("#languages").empty()
        $("#base-currency").empty()       
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
            
            for (let [key, value] of Object.entries(result.currencies)){
                
                $('#exchangeRate').append('<option value="'+key+'">'+value+'</option>')
            }             
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
            }
        })
        $("#modal-currency").modal('show')
       })
 }, 'Show currency info', 'button')
 
showCurrency.addTo(map)

let exchangeRate = ""

function getExchangeRate(value){         
        
            $.ajax({
                url: "libs/php/getExchangeRates.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    base: currency[0]
                },        
                success: function(result) {                             
                   
                    console.log(result)
                    Object.keys(result.rates.conversion_rates).
                    forEach(function eachKey(key){

                        if (key === value){  
                            $("#currency-to-calculate").empty().append((result.rates.conversion_rates[key]).toFixed(2)) 
                            exchangeRate = result.rates.conversion_rates[key]
                           
                            calcResult()
                        }
                   })
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown)
                }
            })       
        }
$('#fromAmount').on('keyup', function () {
    calcResult()    
    })
    
$('#fromAmount').on('change', function () {
    calcResult()
})

$('#exchangeRate').on('change', function () {
    getExchangeRate($('#exchangeRate').val())   
})

function calcResult() {   
    $('#toAmount').val(numeral($('#fromAmount').val() * exchangeRate).format("0,0.00"))
    }

// show weather modal -------------------------------------------------------------------------------------------------------------

let showWeather = L.easyButton('fa-solid fa-cloud-sun', function(btn, map){
    $("#weather-country").empty()
    $(document).ready(function(){
       
        $.ajax({
            url: "libs/php/getWeather.php",
            type: 'POST',
            dataType: 'json',
            data: {
                city: countryInfo[0]['capital'],
                lat: countryInfo[0]['latLng']['capital'][0],
                lng: countryInfo[0]['latLng']['capital'][1],                
            },        
            success: function(result) {         
               
                const iconCode = result.currentWeather.weather[0].icon
                const iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png"
                const description = result.currentWeather.weather[0]['description']
                const descCap = description.charAt(0).toUpperCase() + description.slice(1);
                
                $("#weather-country").empty().append(userCountry)
                $("#weather-capital").empty().append(countryInfo[0]['capital'])   
                $('#weather-icon').attr('src', iconUrl)
                $("#weather-main").empty().append(result.currentWeather.weather[0]['main'])
                $("#weather-description").empty().append(descCap)  
                $("#todayMaxTemp").empty().append(Math.round(result.currentWeather.main['temp_max'] - 273.15).toFixed(1) + '°C')
                $("#todayMinTemp").empty().append(Math.round(result.currentWeather.main['temp_min'] - 273.15).toFixed(1) + '°C')
                $('#day1Date').text((Date.parse(result.forecast.list[8].dt_txt)).toString("ddd dS"))
                $('#day1Icon').attr("src", "http://openweathermap.org/img/w/" + result.forecast.list[1].weather[0].icon + ".png")
                $("#day1MaxTemp").empty().append(Math.round(result.forecast.list[0].main['temp_max'] - 273.15).toFixed(1) + '°C')
                $("#day1MinTemp").empty().append(Math.round(result.forecast.list[4].main['temp_min'] - 273.15).toFixed(1) + '°C')
                $('#day2Date').text((Date.parse(result.forecast.list[16].dt_txt)).toString("ddd dS"))
                $('#day2Icon').attr("src", "http://openweathermap.org/img/w/" + result.forecast.list[2].weather[0].icon + ".png")
                $("#day2MaxTemp").empty().append(Math.round(result.forecast.list[9].main['temp_max'] - 273.15).toFixed(1) + '°C')
                $("#day2MinTemp").empty().append(Math.round(result.forecast.list[13].main['temp_min'] - 273.15).toFixed(1) + '°C')
                
                $("#weather-modal").modal('show')
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown)
            }
        })
        })
}, 'Show weather info', 'button')

showWeather.addTo(map)


// country top headlines modal-------------------------------------------------------------------------------------------------------

let showNews = L.easyButton('fa-solid fa-newspaper', function(btn, map){
    
    $(document).ready(function(){
       
        $.ajax({
            url: "libs/php/getNews.php",
            type: 'GET',
            dataType: 'json',
            data: {
                country: $('#countries').val()
            },        
            success: function(result) {  
             
                $("#news-body").empty()
                for (let i = 0; i < result.articles.length; i++){                    
                    let newsID = "news" + i
                    let newsIDjquery = "#" + newsID
                    let articleBodyID = "article-body" + i
                    let articleDetailsID = "article-body-details" + i 
                    let link = result.articles[i]['link']
                    const source = result.articles[i]['media'] 
                  
                    $("#news-body").append('<div class="news-article" id="'+ newsID + '"><img ><div class="article-body" id="'+articleBodyID+'"><h6></h6><div class="article-body-details" id="'+articleDetailsID+'"></div></div></div><hr>')
                    $(newsIDjquery).children('img').attr("src", source)
                    $('#'+articleBodyID).children('h6').html('<a target="_blank" href="' + link + '">'+ '<b>' + result.articles[i]['title'] +'</b>' + '<br>'  + '</a>')
                    $("#"+articleDetailsID).html('<span>' + result.articles[i]['published_date'].slice(-8) + '</span><span>' + result.articles[i]['clean_url']+'</span>')
                    
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

let showHello = L.easyButton('fa-solid fa-handshake', function(btn, map){
    
    $(document).ready(function(){
       
        $.ajax({
            url: "libs/php/getHello.php",
            type: 'GET',
            dataType: 'json',
            data: {
                country: $('#countries').val()
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
                     
            function addValue() {               
                $('#countries').val(userCountryCode[0])
                getUserCountryBorders()
                getBoundingBox()
            }            
            setTimeout(addValue, 300);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    }); 
}

// helpers -------------------------------------------------------------------------------------------------------------------------

function getBoundingBox() {
   
    $.ajax({
        url: "libs/php/getBoundingBox.php",
        type: 'POST',
        dataType: 'json',
        data: {
           code: $('#countries').val()
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
    ISS.clearLayers()
    // map.removeLayer(ISS)
    // $('#countries').val(value).change()
    cities.clearLayers()
    airports.clearLayers()
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
           	code: value
        },        
        success: function(result) {     
            bordersGroup.clearLayers()
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

function getUserCountryBorders() {
    map.closePopup()
   
    $.ajax({
        url: "libs/php/getUserCountryBorders.php",
        type: 'POST',
        dataType: 'json',
        data: {
            code: $('#countries').val() 
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
                getCities()
                getAirports()               
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
            name: countryName // countryapi.io doesn't support iso_a2 values
        },              
        success: function(result) {                           
          for (let [key, value] of Object.entries(result)) {            
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
                $('#countries').append('<option value="'+feature.code+'">'+feature.name+'</option>') // changed to code from
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

const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
})

// get cities layer control -------------------------------------------------------------------------------------------------------

const cityIcon = L.ExtraMarkers.icon({
    icon: 'fa-city',
    markerColor: 'violet',
    shape: 'square',
    prefix: 'fa'
  })

const cities = L.markerClusterGroup({
    polygonOptions: {
      fillColor: 'violet',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }}).addTo(map)

function getCities() {   
  
    $.ajax({
        url: "libs/php/getCities.php",
        type: 'POST',
        dataType: 'json',
        data: {     
            country: $('#countries').val()          
            },    
        
        success: function(result) {               
            
            result.geonames.forEach(function(item) {
          
                L.marker([item.lat, item.lng], {icon: cityIcon})
                  .bindTooltip("<div class='col text-center'><strong>" + item.name + "</strong><br><i>(" + numeral(item.population).format("0,0") + ")</i></div>", {direction: 'top', sticky: true})
                  .addTo(cities)                
              })
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    })
}

// get airports layer control ------------------------------------------------------------------------------------------------------

const airportIcon = L.ExtraMarkers.icon({
    icon: 'fa-plane',
    iconColor: 'black',
    markerColor: 'white',
    shape: 'circle',
    prefix: 'fa'
  })

const airports = L.markerClusterGroup({
    polygonOptions: {
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }}).addTo(map)

function getAirports() {
   
    $.ajax({
        url: "libs/php/getAirports.php",
        type: 'POST',
        dataType: 'json',
        data: {     
            country: $('#countries').val()         
            },    
        
        success: function(result) {          
        
            result.geonames.forEach(function(item) {
          
                L.marker([item.lat, item.lng], {icon: airportIcon})
                  .bindTooltip(item.name, {direction: 'top', sticky: true})
                  .addTo(airports);
                
              })
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown)
        }
    })
}



// ISS layer control ---------------------------------------------------------------------------------------------------------------

const iconISS = L.icon({
    iconUrl: './images/ISS_icon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [-3, -76],    
})

let ISS = L.layerGroup();

function getISS() {
    
    ISS.clearLayers()
      
        $.ajax({
            url: "libs/php/getISSPosition.php",
            type: 'POST',
            dataType: 'json',    
            
            success: function(result) {  
                const { latitude, longitude } = result            
                let markerISS = L.marker([latitude, longitude], {icon: iconISS})         
               
                ISS.on('add', (e) => {     
                    ISS.clearLayers()          
                    ISS.addLayer(markerISS)
                    map.setView([latitude, longitude], 3)
                })
                ISS.on('remove', (e) => {                    
                    map.fitBounds(bordersGroup.getBounds()) 
                })         
                     
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
                       
                        let planeMarker = L.marker(latLng, {icon: planeIcon}).bindTooltip('<div class="text-center"><strong>Flight ' + result.states[i][1] + 'from ' + result.states[i][2] + '</strong><br><i>(' + Math.round((result.states[i][9])*2.236) + ' mph ' + '/ ' + result.states[i][13] + ' m' + ')</i></div>', {direction: 'top', sticky: true})
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


const earthquakeIcon = L.ExtraMarkers.icon({
icon: 'fa-exclamation',
markerColor: 'red',
shape: 'square',
prefix: 'fa'
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
                eqStr = String(result.earthquakes[i]['datetime'])                
                eqDate = eqStr.slice(8, 10)+ "/" + eqStr.slice(5, 7) + "/"+ eqStr.slice(0,4)                  
                let earthquakeMarker = L.marker(latLng, {icon: earthquakeIcon})
                earthquakeMarker.bindTooltip('<div class="col text-center"><strong>' + eqDate + '</strong> ' + '<br><i>' + ' (' +  result.earthquakes[i]['magnitude'] + ')'+'</i></div>', {direction: 'top', sticky: true})
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
    'Satellite map' : satelliteMap
}

const overlayMaps = {    
    "Cities" : cities,
    "Airports" : airports,
    "Earthquakes": earthquakeGruop,
    "Air traffic": planeGruop,
    "ISS position": ISS,
    
}

const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map)