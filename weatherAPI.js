let requestOptions = {
    method: 'GET',
};

let supportedUnits = [
    "standard"
    ,"metric"
    ,"imperial"
];
let hasVisitedBefore = false;
let preferredUnits;
let userLocation = null;
let gumystara;
let weatherData;
let dataToDisplay


class OpenWeatherApiClient {
    base = "https:\/\/api.openweathermap.org\/data\/";
    apiVersion = "2.5/";
    weatherServices = "weather?";
    weatherForecast = "forecast?";
    airPollutionServices = "air_pollution/forecast?";

    constructor(key){
        this.ApiKey = key;
    }

    linkGetForecastAtPos(latitude, longitude, cnt = 40, units = preferredUnits, language = "en") {
        let url = `${this.base}${this.apiVersion}${this.weatherForecast}lat=${latitude}&lon=${longitude}&cnt=${cnt}&appid=${this.ApiKey}&units=${units}&lang=${language}`;
        return url;
    }

    linkGetWeatherAtPos(latitude, longitude, units = preferredUnits, language = "en") {
        let url = `${this.base}${this.apiVersion}${this.weatherServices}lat=${latitude}&lon=${longitude}&appid=${this.ApiKey}&units=${units}&lang=${language}`;
        return url;
    }
    linkGetAirPollutionForecastAtPos(latitude, longitude){
        let url = `${this.base}${this.apiVersion}${this.airPollutionServices}lat=${latitude}&lon=${longitude}&appid=${this.ApiKey}`;
        return url;
    }

    fetchWeatherAtCoordinates(latitude, longitude){
        let weatherData;
        let link = this.linkGetWeatherAtPos(latitude, longitude);
        fetch(link, requestOptions)
        .then(response => response.json())
        .then(jsonData => {
            weatherData = jsonData;
        updateWeatherDataVariable(jsonData);
    })
        .catch(error => {
            console.error(error);
        });
        return weatherData;
    }

    fetchForecastAtCoordinates(latitude, longitude){
        let forecastData;
        let link = this.linkGetForecastAtPos(latitude, longitude, 40);
        fetch(link, requestOptions)
        .then(response => response.json())
        .then(jsonData => {
            forecastData = jsonData;
        updateForecastDataVariable(jsonData);
    })
        .catch(error => {
            console.error(error);
        });
        return forecastData;
    }

}

let openWeatherCli = new OpenWeatherApiClient("60c88022e2d1d314a4779e6d84984619");

function echoStatus(){
    console.log(userLocation, weatherData);
}

function parseIPResolve(jsonResponse) {
    let address = {
        city: jsonResponse.city.name,
        coordinates: [jsonResponse.location.latitude, jsonResponse.location.longitude],
        isoCode: jsonResponse.country.iso_code,
        capital: jsonResponse.country.capital
    }
    return address;
}

function fetchIPData(){
    let newAddress;
    fetch("https://api.geoapify.com/v1/ipinfo?&apiKey=2b0060bce4334aff8beb322d07440016", requestOptions)
    .then(response => response.json())
    .then(data => parseIPResolve(data))
    .then(address => {
        newAddress = address;
        updateAddressVariable(address);
    })
    .catch(error => {
        console.error(error);
    });
    return newAddress;
}

function updateAddressVariable(address){
    userLocation = address;
}

function updateWeatherDataVariable(weatherJson){
    weatherData = weatherJson;
    updateWidgetData();
}

function updateForecastDataVariable(forecastJson){
    dataToDisplay = forecastJson;
    console.log(dataToDisplay);
    displayWeeklyForecast("user_location", dataToDisplay);
}

function CheckIfValidUnitType(unit){
    return supportedUnits.includes(unit);
}

function LoadAndValidateUnitsVariable(){
    console.log("Loading unit preferrence");
    preferredUnits = localStorage.getItem("units");
    if(!CheckIfValidUnitType(preferredUnits)){
        console.log("Invalid units prefference detected, resetting!");
        preferredUnits = supportedUnits[0];
        localStorage.setItem("units", preferredUnits);
    }
}

function InitializeTheEnvironment(){
    let tryGetLocalUnitsPreference = localStorage.getItem("units");
    if(tryGetLocalUnitsPreference == null) {
        console.log("Preferred units not found! setting to default");
        localStorage.setItem("units", "metric")
    } else {hasVisitedBefore = true};
    LoadAndValidateUnitsVariable();
}



function fetchLocalWeather(){
    console.log("hi");
}

function askForAddress(mesg){
    console.log("hi");
}

function displayWeeklyForecast(weeklyDivContainerID="user_location", dataToDisplay){
    let forecastLenght;
    let forecastsPerDayArray = []
    try{
        forecastLenght = dataToDisplay.list.length;
    } catch {
        return;
    }
    let container = document.getElementById(weeklyDivContainerID);
    console.log("data to display:");
    console.log(dataToDisplay);
    container.children.item(0).textContent = dataToDisplay.city.name;
    let indexTracker = 0;
    let now = new Date;
    let dateString = now.toISOString().slice(0,10);
    let dateToCompare = Date.parse(dateString);
    console.log(dataToDisplay);
    let todayForcast = [dataToDisplay.list[0]];
    for (let index = 0; index < dataToDisplay.list.length; index++) {
        
        if(Date.parse(dataToDisplay.list[index].dt_txt.slice(0,10))>dateToCompare){
            console.log(`break at index:${index}`);
            break;
        }
        indexTracker++;
        if(index>0){
            todayForcast.push(dataToDisplay.list[index]);
        }
    }
    indexTracker--;
    console.log(dataToDisplay.list[indexTracker].dt_txt);
   
    let lastIndexHit = false;
    if (indexTracker>0){
        
    }
    forecastsPerDayArray = [todayForcast];
    for (let index = 0; index < 5; index++) {
        
        if (lastIndexHit){
            break;
        }
        forecastsPerDayArray.push([]);
        let offset = indexTracker+1+8*index;
        for (let x = 0; x < 4; x++) {
            if (lastIndexHit){
                break;
            }
        let recordIndex = offset + x*2;
        if (recordIndex >= 29){
            recordIndex = 29;
            lastIndexHit = true;
        }
        forecastsPerDayArray[forecastsPerDayArray.length-1].push(dataToDisplay.list[recordIndex]);
        }
   
        
    }
    let tableForForecasts = container.children.item(1);
    for (let index = 0; index < forecastsPerDayArray.length; index++) {
        insertDataIntoForecastSlot(tableForForecasts,index,forecastsPerDayArray[index]);
        
    }

}

function parseJsonToDatapoint(jsonData){
    let datapoint = document.createElement('datapoint');
    let time = document.createElement("h3");
    let weather = document.createElement("h3");
    let temperature = document.createElement("h3");
    console.log("json data provided:");
    console.log (jsonData);
    weather.textContent = jsonData.weather[0].main;
    temperature.textContent = (addLegendToTemperature(jsonData.main.temp, preferredUnits));
    time.textContent = jsonData.dt_txt.slice(10,16);
    datapoint.appendChild(time);
    datapoint.appendChild(weather);
    datapoint.appendChild(temperature);
    return datapoint;
}

function insertDataIntoForecastSlot(container, indexOfTheCard,data){
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    //let htmlObj = document.querySelector(`#weeklyForecast :nth-child(${indexOfTheCard})`);

    console.log("container");
    console.log(container);
    console.log(container.children);
        let dateString = data[0].dt_txt;
        let cardDate = new Date(dateString);
        container.children.item(indexOfTheCard).firstElementChild.firstElementChild.textContent = weekday[cardDate.getDay()];
        let p = document.createElement('p');
        p.textContent = dateString.slice(0,10);
        container.children.item(indexOfTheCard).firstElementChild.appendChild(p);
        let limit;
        if(data.length>3){
            console.log("need to trim");
            limit = data.length-3;
        } else{limit = 0};
        for (let index = data.length-1; index >= limit; index--) {
            let datapoint = parseJsonToDatapoint(data[index]);
            container.children.item(indexOfTheCard).lastElementChild.insertAdjacentElement("afterbegin", datapoint);           
        }

        
    }        
function updateWeatherData(locationData){
    let data = openWeatherCli.fetchWeatherAtCoordinates(userLocation.coordinates[0],userLocation.coordinates[1]);
    updateWeatherDataVariable(data);
    let forecast = openWeatherCli.fetchForecastAtCoordinates(userLocation.coordinates[0],userLocation.coordinates[1]);
    updateForecastDataVariable(forecast);
}

function addLegendToTemperature(temperature, format){
    if((format == "standard") || (format == "imperial")){
        return temperature+"℉";
        
    } else {
        return temperature+"℃";
    }
}

function updateWidgetData(){
    try{
    let widgetDataItems = [weatherData.name,weatherData.weather[0].main, weatherData.weather[0].description, weatherData.main.temp_min, weatherData.main.temp, weatherData.main.temp_max]
    console.log(weatherData);
    let widgetElement = document.getElementById("localWidget");
    widgetElement.firstElementChild.textContent=widgetDataItems[0];
    let weatherElement = document.getElementById("currentWeather");
    let listOfChildren = weatherElement.children;
    for (let index = 1; index <= listOfChildren.length; index++) {
        //console.log(listOfChildren[index].textContent);
        let htmlObj = document.querySelector(`#currentWeather :nth-child(${index})`);
        htmlObj.textContent = widgetDataItems[index];
        htmlObj.style.opacity = "100%";
    }
    let clockElement = document.getElementById("miniClock");
    } catch(e) {
        return;
    }
    
    //listOfChildren[0].textContent = weatherData.weather;
}

console.log("Hello API!");
InitializeTheEnvironment();
let myVal;
let asyncFetchLocalWeather = new Promise(function(fetchData, promptForAddress) {
    let addressNode;
    try{
        addressNode =  JSON.parse(localStorage.getItem("userLocation"));
    } catch {
        console.log("can't parse location!");
        localStorage.removeItem("userLocation");
    }
    if(addressNode == null){
        console.log("No address currently in storage!");
        try{ 
            fetchIPData();
            
            addressNode = userLocation;
        }catch {
            promptForAddress("Error resolving user IP");
        }
    } else{
        console.log("Loaded saved address!");
        userLocation = addressNode;
    }
    fetchData(addressNode);

});
asyncFetchLocalWeather.then(
function(value) {updateWeatherData(value);},
function(error) {askForAddress(error);}
);


//(console.log(userLocation));
