// DOM elements
const cityInput = document.querySelector('#cityInput');
const searchButton = document.querySelector('#searchButton');

if (!cityInput || !searchButton) {
    console.error('Required DOM elements not found: #cityInput or #searchButton');
} else {
    // allow Enter key to trigger search
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') search();
    });
    // Create event listeners
    searchButton.addEventListener('click', search);
}

// function convert city to coordinates
    function getCityCoordinates(cityName, callback) {
        const xhr = new XMLHttpRequest();
        const geo_url =  `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;

        // Open a GET request
        xhr.open('GET', geo_url, true)

        // onload 
        xhr.onload = function() {
            if (this.status === 200) {
                const geo_data = JSON.parse(this.responseText);
                if (geo_data.results && geo_data.results.length > 0) {
                    const location = geo_data.results[0];
                    callback(null, {
                        name: location.name,
                        country: location.country,
                        latitude: location.latitude,
                        longitude: location.longitude
                    });
            } else{
                    callback('City not found', null);
                }  
            } else {
                callback('Error: ' + this.status, null);
            }
        }

        // on error 
        xhr.onerror = function() {
            callback('Network error', null);
        }

        // Send the request
        xhr.send();
    }

    // get weather data 
    function getWeather(lat, lon, callback) {
        const xhr = new XMLHttpRequest();
        const weather_url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

        // Open a GET request
        xhr.open('GET', weather_url, true);

        // onload 
    xhr.onload = function() {
            if(this.status === 200) {
                let weather_data;
                try {
                    weather_data = JSON.parse(this.responseText);
                } catch (err) {
                    callback('Invalid JSON from weather API', null);
                    return;
                }

                // ensure current_weather exists
                if (weather_data && weather_data.current_weather) {
                    callback(null, weather_data.current_weather);
                } else {
                    callback('No current_weather in response', null);
                }
            } else {
                callback('Error: ' + this.status, null);
            }
        } 

        // on error 
        xhr.onerror = function() {
            callback('Network error', null);
        }

        // Send the request
        xhr.send();
    }

// search 
function search() {
    const cityName = cityInput.value.trim();

    getCityCoordinates(cityName, function(error, location) {
        if (error) {
            console.error(error);
            document.querySelector('.city-name').textContent = 'Error: ' + error;
            return;
        } else {
            console.log('Found:', location.name, location.country);

            getWeather(location.latitude, location.longitude, function(error, weatherData) {
                if (error) {
                    console.error(error);
                    document.querySelector('.city-name').textContent = 'Error: ' + error;
                    return;
                } else {

                    // Display weather data (safe access)
                    console.log('Weather Data:', weatherData);
                    const cityEl = document.querySelector('.city-name');
                    const tempEl = document.querySelector('.temperature');
                    const descEl = document.querySelector('.description');
                    const windEl = document.querySelector('.wind');

                    if (cityEl) cityEl.textContent = `${location.name}, ${location.country}`;
                    if (tempEl) tempEl.textContent = (weatherData && typeof weatherData.temperature !== 'undefined') ? `${weatherData.temperature}°C` : '--';
                    if (descEl) descEl.textContent = (weatherData && typeof weatherData.weathercode !== 'undefined') ? `Weather Code: ${weatherData.weathercode}` : '';
                    if (windEl) windEl.textContent = (weatherData && typeof weatherData.windspeed !== 'undefined') ? `Wind Speed: ${weatherData.windspeed} km/h` : '';
                }
            });
        }
    })

    // Clear input field
    cityInput.value = '';
}