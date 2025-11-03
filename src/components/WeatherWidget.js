import React, { useState, useEffect } from 'react';
import { weatherService, weatherIcons, severityLevels } from '../services/weatherService';
import LoadingSpinner from './LoadingSpinner';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's location
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lon: longitude });

      // Fetch weather data
      const [currentWeather, weatherForecast, weatherAlerts] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getWeatherForecast(latitude, longitude),
        weatherService.getWeatherAlerts(latitude, longitude)
      ]);

      setWeather(currentWeather);
      setForecast(weatherForecast);
      setAlerts(weatherAlerts);
    } catch (err) {
      setError('Unable to fetch weather data. Please ensure location access is enabled.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="weather-widget-container">
        <div className="auth-card">
          <div className="weather-loading">
            <LoadingSpinner />
            <p>Getting your location and weather data...</p>
            <small>Please allow location access for accurate weather information</small>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget-container">
        <div className="auth-card">
          <div className="weather-error text-center p-4">
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--warning)', marginBottom: '1rem' }}></i>
            <h4>Weather Data Unavailable</h4>
            <p className="text-muted">{error}</p>
            <button onClick={getLocationAndWeather} className="btn btn-primary">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget-container">
      <div className="auth-card">
        <div className="weather-header">
          <h3>
            <i className="fas fa-cloud-sun" style={{ marginRight: '10px', color: 'var(--primary)' }}></i>
            Live Weather Updates
          </h3>
          <button onClick={getLocationAndWeather} className="btn btn-sm btn-outline">
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>

        {/* Current Weather */}
        {weather && (
          <div className="current-weather">
            <div className="weather-location">
              <h4>
                <i className="fas fa-map-marker-alt" style={{ color: 'var(--danger)', marginRight: '8px' }}></i>
                {weather.name}, {weather.sys.country}
              </h4>
              <p className="weather-description" style={{ textTransform: 'capitalize' }}>
                {weather.weather[0].description}
              </p>
            </div>

            <div className="weather-main">
              <div className="temperature-section">
                <i className={weatherIcons[weather.weather[0].icon]} style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
                <div className="temperature">
                  <span className="temp-value">{Math.round(weather.main.temp)}°C</span>
                  <div className="temp-range">
                    H: {Math.round(weather.main.temp_max)}° • L: {Math.round(weather.main.temp_min)}°
                  </div>
                </div>
              </div>

              <div className="weather-details">
                <div className="detail-item">
                  <i className="fas fa-temperature-low"></i>
                  <span>Feels like: {Math.round(weather.main.feels_like)}°C</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-tint"></i>
                  <span>Humidity: {weather.main.humidity}%</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-wind"></i>
                  <span>Wind: {getWindDirection(weather.wind.deg)} {Math.round(weather.wind.speed * 3.6)} km/h</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-compress-arrows-alt"></i>
                  <span>Pressure: {weather.main.pressure} hPa</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-eye"></i>
                  <span>Visibility: {(weather.visibility / 1000).toFixed(1)} km</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        {alerts.length > 0 && (
          <div className="weather-alerts">
            <h5>
              <i className="fas fa-exclamation-triangle" style={{ color: 'var(--danger)', marginRight: '8px' }}></i>
              Active Weather Alerts
            </h5>
            {alerts.map((alert, index) => (
              <div key={index} className={`alert alert-${severityLevels[alert.severity] || 'warning'}`}>
                <strong>{alert.event}</strong>
                <p>{alert.description}</p>
                <small>
                  From: {new Date(alert.start * 1000).toLocaleString()} • 
                  To: {new Date(alert.end * 1000).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}

        {/* 3-Hour Forecast */}
        {forecast && (
          <div className="weather-forecast">
            <h5>
              <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
              24-Hour Forecast
            </h5>
            <div className="forecast-list">
              {forecast.list.slice(0, 8).map((item, index) => (
                <div key={index} className="forecast-item">
                  <div className="forecast-time">{formatTime(item.dt)}</div>
                  <i className={weatherIcons[item.weather[0].icon]} style={{ color: 'var(--primary)' }}></i>
                  <div className="forecast-temp">{Math.round(item.main.temp)}°</div>
                  <div className="forecast-pop">
                    {item.pop > 0 && (
                      <span style={{ color: 'var(--primary)' }}>
                        <i className="fas fa-tint"></i> {Math.round(item.pop * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Preparedness Tips */}
        <div className="safety-tips">
          <h5>
            <i className="fas fa-first-aid" style={{ color: 'var(--danger)', marginRight: '8px' }}></i>
            Safety Tips
          </h5>
          <div className="tips-grid">
            <div className="tip-item">
              <i className="fas fa-bolt"></i>
              <span>During thunderstorms, avoid open areas and tall objects</span>
            </div>
            <div className="tip-item">
              <i className="fas fa-house-flood-water"></i>
              <span>In floods, move to higher ground immediately</span>
            </div>
            <div className="tip-item">
              <i className="fas fa-wind"></i>
              <span>During high winds, stay away from windows</span>
            </div>
            <div className="tip-item">
              <i className="fas fa-snowflake"></i>
              <span>In extreme cold, limit outdoor exposure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;