import { useState } from 'react';
import { fetchRecentRoutes, fetchSavedRoutes } from '../services/api.js';
import { notifyError, notifySuccess } from '../utils/notify.js';
import { normalizeOriginName } from '../utils/routeUtils.js';

export function useStoredRoutes({
  routeForm,
  setRouteForm,
  setOriginName,
  setDestinationName,
  setActiveNav,
  setFavoritesOpen,
  setRecentsOpen,
  refreshRoute,
  rememberRecentRoute
}) {
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [recentRoutes, setRecentRoutes] = useState([]);

  const openFavorites = async () => {
    try {
      await refreshSavedRoutes();
    } catch {
      setSavedRoutes([]);
      notifyError('No se pudieron leer los favoritos guardados', 'favorites-read-error');
    }
    setFavoritesOpen(true);
  };

  const refreshSavedRoutes = async () => {
    const routes = await fetchSavedRoutes();
    setSavedRoutes(routes);
    return routes;
  };

  const openRecents = async () => {
    try {
      await refreshRecentRoutes();
    } catch {
      setRecentRoutes([]);
      notifyError('No se pudieron leer las rutas recientes', 'recents-read-error');
    }
    setRecentsOpen(true);
  };

  const refreshRecentRoutes = async () => {
    const routes = await fetchRecentRoutes();
    setRecentRoutes(routes);
    return routes;
  };

  const loadSavedRoute = async (savedRoute) => {
    const nextForm = savedRoute.form ?? {
      ...routeForm,
      origin_lat: String(savedRoute.origin.lat),
      origin_lng: String(savedRoute.origin.lng),
      dest_lat: String(savedRoute.destination.lat),
      dest_lng: String(savedRoute.destination.lng)
    };

    setRouteForm(nextForm);
    setOriginName(normalizeOriginName(savedRoute.originName) || 'Punto de partida');
    setDestinationName(savedRoute.name);
    setFavoritesOpen(false);
    setActiveNav('Navegar');

    try {
      const data = await refreshRoute(nextForm, true, false);
      await rememberRecentRoute(nextForm, data, savedRoute.name);
      notifySuccess('Ruta cargada desde favoritos', 'favorite-loaded');
    } catch {
      notifyError('No se pudo recalcular la ruta guardada', 'favorite-load-error');
    }
  };

  const loadRecentRoute = async (recentRoute) => {
    const nextForm = recentRoute.form ?? {
      ...routeForm,
      origin_lat: String(recentRoute.origin.lat),
      origin_lng: String(recentRoute.origin.lng),
      dest_lat: String(recentRoute.destination.lat),
      dest_lng: String(recentRoute.destination.lng)
    };

    setRouteForm(nextForm);
    setOriginName(normalizeOriginName(recentRoute.originName) || 'Punto de partida');
    setDestinationName(recentRoute.name);
    setRecentsOpen(false);
    setActiveNav('Navegar');

    try {
      const data = await refreshRoute(nextForm, true, false);
      await rememberRecentRoute(nextForm, data, recentRoute.name);
      notifySuccess('Ruta reciente cargada', 'recent-loaded');
    } catch {
      notifyError('No se pudo cargar la ruta reciente', 'recent-load-error');
    }
  };

  return {
    savedRoutes,
    setSavedRoutes,
    recentRoutes,
    setRecentRoutes,
    openFavorites,
    openRecents,
    refreshSavedRoutes,
    refreshRecentRoutes,
    loadSavedRoute,
    loadRecentRoute
  };
}
