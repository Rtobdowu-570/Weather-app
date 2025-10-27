"use strict";

// DOM elements
var cityInput = document.querySelector('#cityInput');
var searchButton = document.querySelector('#searchButton');

if (!cityInput || !searchButton) {
  console.error('Required DOM elements not found: #cityInput or #searchButton');
} else {
  // allow Enter key to trigger search
  cityInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') search();
  }); // Create event listeners

  searchButton.addEventListener('click', search);
} // function convert city to coordinates


function getCityCoordinates(cityName, callback) {
  var xhr = new XMLHttpRequest();
  var geo_url = "https://geocoding-api.open-meteo.com/v1/search?name=".concat(encodeURIComponent(cityName), "&count=1"); // Open a GET request

  xhr.open('GET', geo_url, true); // onload 

  xhr.onload = function () {
    if (this.status === 200) {
      var geo_data = JSON.parse(this.responseText);

      if (geo_data.results && geo_data.results.length > 0) {
        var location = geo_data.results[0];
        callback(null, {
          name: location.name,
          country: location.country,
          latitude: location.latitude,
          longitude: location.longitude
        });
      } else {
        callback('City not found', null);
      }
    } else {
      callback('Error: ' + this.status, null);
    }
  }; // on error 


  xhr.onerror = function () {
    callback('Network error', null);
  }; // Send the request


  xhr.send();
} // get weather data 


function getWeather(lat, lon, callback) {
  var xhr = new XMLHttpRequest();
  var weather_url = "https://api.open-meteo.com/v1/forecast?latitude=".concat(lat, "&longitude=").concat(lon, "&current_weather=true"); // Open a GET request

  xhr.open('GET', weather_url, true); // onload 

  xhr.onload = function () {
    if (this.status === 200) {
      var weather_data;

      try {
        weather_data = JSON.parse(this.responseText);
      } catch (err) {
        callback('Invalid JSON from weather API', null);
        return;
      } // ensure current_weather exists


      if (weather_data && weather_data.current_weather) {
        callback(null, weather_data.current_weather);
      } else {
        callback('No current_weather in response', null);
      }
    } else {
      callback('Error: ' + this.status, null);
    }
  }; // on error 


  xhr.onerror = function () {
    callback('Network error', null);
  }; // Send the request


  xhr.send();
} // search 


function search() {
  var cityName = cityInput.value.trim();
  getCityCoordinates(cityName, function (error, location) {
    if (error) {
      console.error(error);
      document.querySelector('.city-name').textContent = 'Error: ' + error;
      return;
    } else {
      console.log('Found:', location.name, location.country);
      getWeather(location.latitude, location.longitude, function (error, weatherData) {
        if (error) {
          console.error(error);
          document.querySelector('.city-name').textContent = 'Error: ' + error;
          return;
        } else {
          // Display weather data (safe access)
          console.log('Weather Data:', weatherData);
          var cityEl = document.querySelector('.city-name');
          var tempEl = document.querySelector('.temperature');
          var descEl = document.querySelector('.description');
          var windEl = document.querySelector('.wind');
          if (cityEl) cityEl.textContent = "".concat(location.name, ", ").concat(location.country);
          if (tempEl) tempEl.textContent = weatherData && typeof weatherData.temperature !== 'undefined' ? "".concat(weatherData.temperature, "\xB0C") : '--';
          if (descEl) descEl.textContent = weatherData && typeof weatherData.weathercode !== 'undefined' ? "Weather Code: ".concat(weatherData.weathercode) : '';
          if (windEl) windEl.textContent = weatherData && typeof weatherData.windspeed !== 'undefined' ? "Wind Speed: ".concat(weatherData.windspeed, " km/h") : '';
        }
      });
    }
  }); // Clear input field

  cityInput.value = '';
}
//# sourceMappingURL=index.dev.js.map
