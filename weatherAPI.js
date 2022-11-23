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
let dataToDisplay;
let searchResultAddress;


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

    fetchWeatherAtCoordinates(latitude, longitude, callback){
        let weatherData;
        let link = this.linkGetWeatherAtPos(latitude, longitude);
        fetch(link, requestOptions)
        .then(response => response.json())
        .then(jsonData => {
            weatherData = jsonData;
            console.log("weatherData");
            console.log(weatherData);
            callback(jsonData);
    })
        .catch(error => {
            console.error(error);
        });
        
    }

    fetchForecastAtCoordinates(latitude, longitude, callback){
        let forecastData;
        let link = this.linkGetForecastAtPos(latitude, longitude, 40);
        fetch(link, requestOptions)
        .then(response => response.json())
        .then(jsonData => {
            forecastData = jsonData;
            callback(jsonData);
            return jsonData;
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

function parseAutoCompleteAddressChoice(jsonObject) {
    let address = {
        city: jsonObject.properties.city,
        coordinates: [jsonObject.properties.lat, jsonObject.properties.lon],
        isocode: jsonObject.properties.country_code,
        capital: null
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
    localStorage.setItem("userLocation", JSON.stringify(address));
    location.reload();
}

function updateWeatherDataVariable(weatherJson){
    weatherData = weatherJson;
    updateWidgetData();
}

function updateForecastDataVariable(forecastJson){
    
    console.log("updating forecast variable with:");
    console.log(forecastJson);
    if(forecastJson != null){
    dataToDisplay = forecastJson;
    displayWeeklyForecast("user_location", dataToDisplay);
    
    }
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
    console.log("address couldn't be resolved, going straight to adress search option");
}
function createNewFiveDayForecast(jsonData, id){
    console.log("starting creating");
    let container = document.createElement("div");
    container.className = "fadeInClass";
    let town = document.createElement("h1");

    let forecastLenght;
    let forecastsPerDayArray = []
    try{
        forecastLenght = jsonData.list.length;
    } catch {
        return null;
    }
    town.textContent = jsonData.city.name;
    container.appendChild(town);
    let slotContainer = document.createElement("div");
    slotContainer.className = "weeklyForecast";
    let indexTracker = 0;
    let now = new Date;
    let dateString = now.toISOString().slice(0,10);
    let dateToCompare = Date.parse(dateString);
    let todayForcast = [jsonData.list[0]];
    for (let index = 0; index < jsonData.list.length; index++) {
        
        if(Date.parse(jsonData.list[index].dt_txt.slice(0,10))>dateToCompare){
            //console.log(`break at index:${index}`);
            break;
        }
        indexTracker++;
        if(index>0){
            todayForcast.push(jsonData.list[index]);
        }
    }
    indexTracker--;
   
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
        forecastsPerDayArray[forecastsPerDayArray.length-1].push(jsonData.list[recordIndex]);
        }
   
        
    }
    console.log("forecastsPerDayArray");
    console.log(forecastsPerDayArray);
    for (let index = 0; index < forecastsPerDayArray.length; index++) {
        let slot =createForecastSlot(forecastsPerDayArray[index]);
        slot.className = "dayOfTheWeek";
        slotContainer.appendChild((slot));
        
    }
    container.appendChild(slotContainer);
    container.id = id;
    return container;

}

function addSetHomeAddressButton(divToAddTheButtonTo){
    let button = document.createElement("button");
    button.textContent = "SET AS HOME";
    button.addEventListener("click", function(e) {
        updateAddressVariable(searchResultAddress);
    })
    divToAddTheButtonTo.appendChild(button);
    return divToAddTheButtonTo;

}

function displayWeeklyForecast(weeklyDivContainerID, dataToDisplay){
    
    console.log(weeklyDivContainerID);
    console.log(weeklyDivContainerID);
    let obj = document.getElementById("forecastsContainer");
    let newContent = createNewFiveDayForecast(dataToDisplay,weeklyDivContainerID);
    if(weeklyDivContainerID == "search_result"){
        newContent = addSetHomeAddressButton(newContent);
    }
    try {
        console.log(newContent);
    
    } catch(e){
        console.log(e);
        return}
    try{
        let div = document.getElementById(weeklyDivContainerID);
        try {
        if(div != null){
            console.log("updating div");
            newContent.id = weeklyDivContainerID;
            obj.replaceChild(newContent,div);
            document.getElementById("forecastsContainer").style.animationPlayState = "running";
            
            
        } else {
            console.log("appending new div");
            //newContent.id = weeklyDivContainerID;
            obj.appendChild(newContent);
            document.getElementById("forecastsContainer").style.animationPlayState = "running";
            
        }
        } catch {
            console.log("error");
        }
    } catch {
        console.log("error get my id");
        return
    }
    
    
    try{

    
    
   }   catch{
    return;
}

}

function parseJsonToDatapoint(jsonData){
    let datapoint = document.createElement('datapoint');
    let time = document.createElement("h3");
    let weather = document.createElement("h3");
    let temperature = document.createElement("h3");

    weather.textContent = jsonData.weather[0].main;
    temperature.textContent = (addLegendToTemperature(jsonData.main.temp, preferredUnits));
    time.textContent = jsonData.dt_txt.slice(10,16);
    datapoint.appendChild(time);
    datapoint.appendChild(weather);
    datapoint.appendChild(temperature);
    return datapoint;
}

function createForecastSlot(data){
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    
    let dateString = data[0].dt_txt;
        let cardDate = new Date(dateString);
        let cardDIV = document.createElement("div");
        let newHeader = document.createElement("header");
        let newDay = document.createElement("h3");
        let newDate = document.createElement('p');
        newDay.textContent = weekday[cardDate.getDay()];
        newDate.textContent = dateString.slice(0,10);
        newHeader.appendChild(newDay);
        newHeader.appendChild(newDate);
        cardDIV.prepend(newHeader);
        let dailyForecast = document.createElement("div");
        dailyForecast.className = "dailyForecast";
        let limit;
        if(data.length>3){
            limit = data.length-3;
        } else{limit = 0};
        for (let index = data.length-1; index >= limit; index--) {
            let datapoint = parseJsonToDatapoint(data[index]);                
            dailyForecast.appendChild(datapoint);
        }
        cardDIV.appendChild(dailyForecast);
        return cardDIV;
}

     
function updateWeatherData(locationData){
    try{
    let data = openWeatherCli.fetchWeatherAtCoordinates(userLocation.coordinates[0],userLocation.coordinates[1],updateWeatherDataVariable);
    console.log("data");
     console.log(data);
    } catch {
        localStorage.clear();
    }
    let forecast = openWeatherCli.fetchForecastAtCoordinates(userLocation.coordinates[0],userLocation.coordinates[1],updateForecastDataVariable);
    
    
}

function addLegendToTemperature(temperature, format){
    if((format == "standard") || (format == "imperial")){
        return temperature+"℉";
        
    } else {
        return temperature+"℃";
    }
}

function updateUnitPrefferenceCallback(value){
    localStorage.setItem("units", value);
    location.reload();
}

function displayCurrentUnitSetting(){
    let unitNode = document.createElement("div");
    unitNode.id = "unitPreference";
    let imperial = document.createElement("h5");
    imperial.id = "imperial";
    imperial.textContent = "℉";
    let metric = document.createElement("h5");
    metric.id = "metric";
    metric.textContent = "℃";


    if(preferredUnits == "imperial" || preferredUnits == "standard"){
        imperial.className = "highlightActiveUnitSetting";
        metric.className = "notActiveOption";
        metric.addEventListener("click", function() {
            updateUnitPrefferenceCallback("metric");
        });

    } else {
        metric.className = "highlightActiveUnitSetting";
        imperial.className = "notActiveOption";
        imperial.addEventListener("click", function() {
            updateUnitPrefferenceCallback("imperial");
        });
        //metric.addEventListener("click", updateUnitPrefferenceCallback("metric"));
        
    }

    console.log("Current unit setting:");
    console.log(preferredUnits);
    unitNode.appendChild(imperial);
    unitNode.appendChild(metric);
    return unitNode;
}


function updateWidgetData(){
    console.log("Trying to update widget");
    let widgetElement = document.getElementById("localWidget");
    
    try{
    let widgetDataItems = [weatherData.name,weatherData.weather[0].main, weatherData.weather[0].description, weatherData.main.temp_min, weatherData.main.temp, weatherData.main.temp_max]
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
        
    }
    widgetElement.appendChild(displayCurrentUnitSetting());
    
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
let currentPromise;
let promiseReject;
let currentAutofill;
let currentDropdownItems;
let addressInputField;
function createSearchResultDiv(data){
    displayWeeklyForecast("search_result",data);
}
function displayWeatherForSearchResult(address){
    searchResultAddress = address;
    let newData = openWeatherCli.fetchForecastAtCoordinates(address.coordinates[0],address.coordinates[1], createSearchResultDiv);
    
}
function displayWeatherForNewAddress(divName, address){
    let newData = openWeatherCli.fetchForecastAtCoordinates(address.coordinates[0],address.coordinates[1]);

    displayWeeklyForecast(divName,newData);

    }
function fetchAddressAutocomplete(){
    let promiseToReturn = new Promise((resolve, reject) => {
        promiseReject = reject;
  
        let apiKey = "2b0060bce4334aff8beb322d07440016";
        let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${apiKey}`;
        fetch(url)
          .then(response => {
            // check if the call was successful
            if (response.ok) {
              response.json().then(data => resolve(data));
            } else {
              response.json().then(data => reject(data));
            }
          });
    });
    return promiseToReturn;
}
function autocompleteHandler(e){
    clearDropDown(addressInputField);
    console.log("in the handler")
    currentValue = this.value;
    if (promiseReject) {
        promiseReject({
        canceled: true
        });
    }

    if (!currentValue) {
        return false;
    }
    console.log("true");
    currentValue = this.value;
    let fetchPromise =fetchAddressAutocomplete();
    fetchPromise.then((data) => {
        console.log("processing adress lookup");
        console.log(currentValue);
        currentItems = data.features;
        let autocompleteItemsElement = document.createElement("div");
        autocompleteItemsElement.setAttribute("class", "autocomplete-items");
        addressInputField.insertAdjacentElement("beforebegin",autocompleteItemsElement);
        data.features.forEach((feature, index) => {
            /* Create a DIV element for each element: */
            let itemElement = document.createElement("DIV");
            /* Set formatted address as item value */
            itemElement.innerHTML = feature.properties.formatted;
            autocompleteItemsElement.appendChild(itemElement);
            itemElement.addEventListener("click", function(e) {
                //inputElement.value = currentItems[index].properties.formatted;
                console.log(currentItems[index]);
                displayWeatherForSearchResult(parseAutoCompleteAddressChoice(currentItems[index]));
                ;
                /* Close the list of autocompleted values: */
                clearDropDown();
            });
            autocompleteItemsElement.appendChild(itemElement);
      });
    }, (err) => {
    if (!err.canceled) {
        console.log(err);
    }
    });

    

}
function clearDropDown(containerElementa) {
    let containerElement = document.getElementById("addressLookupDiv");
    let autocompleteItemsElement = containerElement.querySelector(".autocomplete-items");
    if (autocompleteItemsElement) {
      containerElement.removeChild(autocompleteItemsElement);
    }
  }
let autocompleteItemsElement = document.createElement("div");
    autocompleteItemsElement.setAttribute("class", "autocomplete-items");
addressInputField = document.getElementById("addressInput");
addressInputField.insertAdjacentElement("beforebegin", autocompleteItemsElement)
addressInputField.addEventListener("input",autocompleteHandler);




//(console.log(userLocation));
