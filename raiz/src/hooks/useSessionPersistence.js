import { useEffect } from 'react';
import { saveSessionSettings } from '../utils/sessionStorage.js';

export function useSessionPersistence({
  theme,
  mapLayer,
  routeForm,
  originName,
  destinationName,
  vehicleConfig
}) {
  useEffect(() => {
    saveSessionSettings({
      theme,
      mapLayer,
      routeForm,
      originName,
      destinationName,
      vehicleConfig
    });
  }, [destinationName, mapLayer, originName, routeForm, theme, vehicleConfig]);
}
