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




class OpenWeatherApiClient {
    base = "https:\/\/api.openweathermap.org\/data\/";
    apiVersion = "2.5/";
    weatherServices = "weather?";
    airPollutionServices = "air_pollution/forecast?";

    constructor(key){
        this.ApiKey = key;
    }

    getForecastAtPos(latitude, longitude, units = preferredUnits, language = "en") {
        let url = `${this.base}${this.apiVersion}${this.weatherServices}lat=${latitude}&lon=${longitude}&appid=${this.ApiKey}&units=${units}&lang=${language}`;
        return url;
    }
    getAirPollutionForecastAtPos(latitude, longitude){
        let url = `${this.base}${this.apiVersion}${this.airPollutionServices}lat=${latitude}&lon=${longitude}&appid=${this.ApiKey}`;
        return url;
    }
}

let openWeatherCli = new OpenWeatherApiClient("60c88022e2d1d314a4779e6d84984619");





function ResolveUserIP(){
    fetch("https://api.geoapify.com/v1/ipinfo?&apiKey=2b0060bce4334aff8beb322d07440016", requestOptions)
.then(response => response.json())
.then(result => {
    let cityName = result.city.name;
    let iso = result.country.iso_code;
    let coordinates = [result.location.latitude, result.location.longitude];
    let capital = result.country.capital;
    addressNode = {
        city: cityName,
        isoCode: iso,
        coordinates: coordinates,
        capital: capital
    };
   localStorage.setItem("userLocation", JSON.stringify(addressNode));
   return addressNode;
}).then(newResult)
.catch(error => {
    console.log('resolving the IP failed', error);
    throw(error);
});


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

function manualPrint(text){
    console.log(t)
}

function fetchLocalWeather(){
    console.log("hi");
}

function askForAddress(mesg){
    console.log("hi");
}

function updateTheMap(locationData){
    userLocation = locationData;
    console.log(openWeatherCli.getForecastAtPos(locationData.coordinates[0],locationData.coordinates[1]));

}

console.log("Hello API!");
InitializeTheEnvironment();
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
            ResolveUserIP();
            addressNode = userLocation;
        }catch {
            promptForAddress("Error resolving user IP");
        }
    } else{
        userLocation = addressNode;
    }
    fetchData(addressNode);

});

asyncFetchLocalWeather.then(
    function(value) {updateTheMap(value);},
    function(error) {askForAddress(error);}
);
console.log(userLocation);
