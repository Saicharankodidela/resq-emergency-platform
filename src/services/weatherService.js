const API_KEY = '76ecf77dc41b89a9373391b313bcf9a4';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const weatherService = {
  // Get current weather by coordinates
  async getCurrentWeather(lat, lon) {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  },

  // Get weather forecast
  async getWeatherForecast(lat, lon) {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Forecast data fetch failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  },

  // Get weather alerts
  async getWeatherAlerts(lat, lon) {
    try {
      const response = await fetch(
        `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Alert data fetch failed');
      }
      
      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }
};

// Weather icon mapping
export const weatherIcons = {
  '01d': 'fas fa-sun',           // clear sky day
  '01n': 'fas fa-moon',          // clear sky night
  '02d': 'fas fa-cloud-sun',     // few clouds day
  '02n': 'fas fa-cloud-moon',    // few clouds night
  '03d': 'fas fa-cloud',         // scattered clouds
  '03n': 'fas fa-cloud',         // scattered clouds
  '04d': 'fas fa-cloud',         // broken clouds
  '04n': 'fas fa-cloud',         // broken clouds
  '09d': 'fas fa-cloud-rain',    // shower rain
  '09n': 'fas fa-cloud-rain',    // shower rain
  '10d': 'fas fa-cloud-sun-rain',// rain day
  '10n': 'fas fa-cloud-moon-rain',// rain night
  '11d': 'fas fa-bolt',          // thunderstorm
  '11n': 'fas fa-bolt',          // thunderstorm
  '13d': 'fas fa-snowflake',     // snow
  '13n': 'fas fa-snowflake',     // snow
  '50d': 'fas fa-smog',          // mist
  '50n': 'fas fa-smog'           // mist
};

// Severity level mapping
export const severityLevels = {
  'Extreme': 'danger',
  'Severe': 'warning',
  'Moderate': 'info',
  'Minor': 'success'
};