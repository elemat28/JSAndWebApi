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


class OpenWeatherApiClient {
    base = "https:\/\/api.openweathermap.org\/data\/";
    apiVersion = "2.5/";
    weatherServices = "weather?";
    airPollutionServices = "air_pollution/forecast?";

    constructor(key){
        this.ApiKey = key;
    }

    linkGetForecastAtPos(latitude, longitude, units = preferredUnits, language = "en") {
        let url = `${this.base}${this.apiVersion}${this.weatherServices}lat=${latitude}&lon=${longitude}&appid=${this.ApiKey}&units=${units}&lang=${language}`;
        return url;
    }
    linkGetAirPollutionForecastAtPos(latitude, longitude){
        let url = `${this.base}${this.apiVersion}${this.airPollutionServices}lat=${latitude}&lon=${longitude}&appid=${this.ApiKey}`;
        return url;
    }

    fetchWeatherAtCoordinates(latitude, longitude){
        let weatherData;
        let link = this.linkGetForecastAtPos(latitude, longitude);
        fetch(link, requestOptions)
        .then(response => response.json())
        .then(jsonData => {weatherData = jsonData;
            updateWeatherVariable(jsonData);
        }).then(jsonData => echoStatus())
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

function updateWeatherVariable(weatherJson){
    weatherData = weatherJson;
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

function updateWeatherData(locationData){
    openWeatherCli.fetchWeatherAtCoordinates(userLocation.coordinates[0],userLocation.coordinates[1]);
    //userLocation = locationData;
    //console.log());

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
(console.log(userLocation));
