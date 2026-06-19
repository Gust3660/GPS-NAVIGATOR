import { useState } from 'react';
import { fetchCurrentWeather } from '../services/api.js';

export function useWeatherPanel() {
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  const loadCurrentWeather = () => {
    if (!navigator.geolocation) {
      setWeatherError('Tu navegador no permite obtener ubicacion para consultar clima.');
      return;
    }

    setWeatherOpen(true);
    setWeatherLoading(true);
    setWeatherError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await fetchCurrentWeather(coords.latitude, coords.longitude);
          setWeatherData(data);
        } catch (error) {
          setWeatherError(error.message || 'No se pudo consultar clima real.');
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeatherError('No se pudo obtener tu ubicacion. Revisa el permiso del navegador.');
        setWeatherLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 120000
      }
    );
  };

  return {
    weatherOpen,
    setWeatherOpen,
    weatherData,
    weatherLoading,
    weatherError,
    loadCurrentWeather
  };
}
