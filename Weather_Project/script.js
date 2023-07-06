const API_KEY = "d264fa3771f652d7c41ab79403750c8f";

const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchForm = document.querySelector("[data-searchForm]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const userInfoContainer = document.querySelector(".user-info-container");
const apiError = document.querySelector(".api-error-container");
const fetchError = document.querySelector(".error");
const grantAccessButton = document.querySelector("[data-grantAccess]");

let oldTab = userTab;
oldTab.classList.add("current-tab");
getfromSessionStorage();

function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

function switchTab(newTab) {
    if(oldTab != newTab){
        
        fetchError.classList.remove("active");
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            grantAccessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            searchForm.classList.add("active")
        }else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});
searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

function renderWeatherInfo(weatherInfo) {

    const cityName = document.querySelector("[data-cityName]");
    cityName.innerText = weatherInfo?.name;

    const countryIcon = document.querySelector("[data-countryIcon]");
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    
    const desc = document.querySelector("[data-weatherDesc]");
    desc.innerText = desc.innerText = weatherInfo?.weather?.[0]?.description;

    const weatherIcon = document.querySelector("[data-weatherIcon]");
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    
    const temp = document.querySelector("[data-temp]");
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    
    const windspeed = document.querySelector("[data-windspeed]");
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    
    const humidity = document.querySelector("[data-humidity]"); 
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    
    const cloudiness = document.querySelector("[data-cloudiness]");
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

}

const loadingScreen = document.querySelector(".loading-container");

async function fetchUserWeatherInfo(Coordinates) {
    const {lat, lon} = Coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        fetchError.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }catch(err) {
        loadingScreen.classList.remove("active");
        fetchError.classList.add("active");

    }
}

function showPosition(position) {
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const messageText = document.querySelector("[data-messageText]");

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }else {
        grantAccessBtn.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      messageText.innerText = "You denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      messageText.innerText = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      messageText.innerText = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      messageText.innerText = "An unknown error occurred.";
      break;
  }
}

grantAccessButton.addEventListener("click", getLocation);

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        fetchError.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        fetchError.classList.add("active");
    }
}

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
    searchInput.value = "";
});
