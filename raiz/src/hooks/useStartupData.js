import { useEffect } from 'react';
import { fetchAlerts, fetchRecentRoutes, fetchRedZones } from '../services/api.js';
import { hasDestination, hasOrigin } from '../utils/routeGuards.js';
import { CURRENT_LOCATION_LABEL } from '../utils/routeUtils.js';
import { notifyInfo } from '../utils/notify.js';

export function useStartupData({
  routeForm,
  setRouteForm,
  setOriginName,
  setLocatingOrigin,
  setAlerts,
  setRecentRoutes,
  setRedZones,
  refreshRoute,
  setActiveNav,
  setSummaryOpen
}) {
  useEffect(() => {
    if (navigator.geolocation && !hasOrigin(routeForm)) {
      setLocatingOrigin(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const nextOrigin = {
            ...routeForm,
            origin_lat: coords.latitude.toFixed(6),
            origin_lng: coords.longitude.toFixed(6)
          };

          setRouteForm(nextOrigin);
          setOriginName(CURRENT_LOCATION_LABEL);
          setLocatingOrigin(false);

          if (hasDestination(nextOrigin)) {
            refreshRoute(nextOrigin, true, false)
              .then(() => {
                setActiveNav('Navegar');
                setSummaryOpen(true);
              })
              .catch(() => {});
          }
        },
        () => {
          setLocatingOrigin(false);
          setOriginName('Selecciona origen');
          notifyInfo('Selecciona el punto de partida o permite la ubicacion del navegador', 'startup-location-info');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    } else if (!navigator.geolocation && !hasOrigin(routeForm)) {
      setOriginName('Selecciona origen');
    }

    fetchAlerts()
      .then((data) => setAlerts(data.slice(-4).reverse()))
      .catch(() => setAlerts([]));
    fetchRecentRoutes()
      .then((routes) => setRecentRoutes(routes))
      .catch(() => setRecentRoutes([]));
    fetchRedZones()
      .then((zones) => setRedZones(zones))
      .catch(() => setRedZones([]));
  }, []);
}
