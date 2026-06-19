import { useState } from 'react';
import { fetchGeocode } from '../services/api.js';
import { hasDestination, hasOrigin } from '../utils/routeGuards.js';
import { notifyError, notifyInfo, notifySuccess } from '../utils/notify.js';
import { isStaleRouteError } from './useRouteController.js';
import { usePlaceSuggestions } from './usePlaceSuggestions.js';

export function usePlaceRouting({
  routeForm,
  setRouteForm,
  setRouteResult,
  origin,
  setOriginName,
  setDestinationName,
  setActiveNav,
  setSummaryOpen,
  mapInstance,
  refreshRoute
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [originEditing, setOriginEditing] = useState(false);
  const [originQuery, setOriginQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [originSearching, setOriginSearching] = useState(false);
  const [destinationEditing, setDestinationEditing] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [destinationSearching, setDestinationSearching] = useState(false);
  const [stopEditingId, setStopEditingId] = useState(null);
  const [stopQuery, setStopQuery] = useState('');
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [stopSearching, setStopSearching] = useState(false);

  usePlaceSuggestions({
    enabled: searchOpen,
    query,
    origin,
    setSuggestions: setSearchSuggestions,
    setSearching
  });

  usePlaceSuggestions({
    enabled: originEditing,
    query: originQuery,
    origin,
    setSuggestions: setOriginSuggestions,
    setSearching: setOriginSearching
  });

  usePlaceSuggestions({
    enabled: destinationEditing,
    query: destinationQuery,
    origin,
    setSuggestions: setDestinationSuggestions,
    setSearching: setDestinationSearching
  });

  usePlaceSuggestions({
    enabled: Boolean(stopEditingId),
    query: stopQuery,
    origin,
    setSuggestions: setStopSuggestions,
    setSearching: setStopSearching
  });

  const applyDestination = async (place) => {
    const nextForm = { ...routeForm, dest_lat: String(place.lat), dest_lng: String(place.lng) };
    setDestinationName(place.name || place.display_name || 'Destino');
    setRouteForm(nextForm);
    setRouteResult(null);
    setSummaryOpen(false);
    setSearchOpen(false);
    setDestinationEditing(false);
    setDestinationQuery('');
    setDestinationSuggestions([]);

    mapInstance?.flyTo([Number(place.lat), Number(place.lng)], Math.max(mapInstance.getZoom(), 13), {
      duration: 0.75
    });

    if (!hasOrigin(nextForm)) {
      setRouteResult(null);
      setSummaryOpen(false);
      notifyInfo('Destino guardado. Obten tu ubicacion real para trazar la ruta', 'destination-needs-origin');
      return;
    }

    try {
      await refreshRoute(nextForm);
      setActiveNav('Navegar');
      setSummaryOpen(true);
      notifySuccess('Destino actualizado', 'destination-updated');
    } catch (error) {
      if (isStaleRouteError(error)) return;
      notifyError('No se pudo actualizar el destino', 'destination-update-error');
    }
  };

  const applyOrigin = async (place) => {
    const nextForm = { ...routeForm, origin_lat: String(place.lat), origin_lng: String(place.lng) };
    setOriginName(place.name || place.display_name || 'Punto de partida');
    setRouteForm(nextForm);
    if (hasDestination(nextForm)) {
      setRouteResult(null);
      setSummaryOpen(false);
    }
    setOriginEditing(false);
    setOriginQuery('');
    setOriginSuggestions([]);

    mapInstance?.flyTo([Number(place.lat), Number(place.lng)], Math.max(mapInstance.getZoom(), 14), {
      duration: 0.75
    });

    try {
      if (hasDestination(nextForm)) {
        await refreshRoute(nextForm);
      }
      notifySuccess('Punto de partida actualizado', 'origin-manual-updated');
    } catch (error) {
      if (isStaleRouteError(error)) return;
      notifyError('No se pudo actualizar el punto de partida', 'origin-manual-error');
    }
  };

  const closeStopEditor = () => {
    setStopEditingId(null);
    setStopQuery('');
    setStopSuggestions([]);
  };

  const openAddStop = () => {
    setStopEditingId('new');
    setStopQuery('');
    setStopSuggestions([]);
  };

  const openEditStop = (stop) => {
    setStopEditingId(stop.id);
    setStopQuery(stop.name || `${stop.lat}, ${stop.lng}`);
    setStopSuggestions([]);
  };

  const applyStop = async (place) => {
    const stop = {
      id: stopEditingId && stopEditingId !== 'new' ? stopEditingId : `stop-${Date.now()}`,
      name: place.name || place.display_name || 'Parada',
      lat: String(place.lat),
      lng: String(place.lng)
    };
    const currentStops = Array.isArray(routeForm.stops) ? routeForm.stops : [];
    const nextStops = stopEditingId && stopEditingId !== 'new'
      ? currentStops.map((item) => (item.id === stopEditingId ? stop : item))
      : [...currentStops, stop];
    const nextForm = { ...routeForm, stops: nextStops };

    setRouteForm(nextForm);
    setRouteResult(null);
    setSummaryOpen(false);
    closeStopEditor();

    mapInstance?.flyTo([Number(stop.lat), Number(stop.lng)], Math.max(mapInstance.getZoom(), 13), {
      duration: 0.75
    });

    if (!hasOrigin(nextForm) || !hasDestination(nextForm)) {
      setRouteResult(null);
      setSummaryOpen(false);
      notifyInfo('Parada guardada. Completa origen y destino para trazar la ruta', 'stop-needs-route');
      return;
    }

    try {
      await refreshRoute(nextForm);
      setActiveNav('Navegar');
      setSummaryOpen(true);
      notifySuccess('Parada agregada a la ruta', 'stop-updated');
    } catch (error) {
      if (isStaleRouteError(error)) return;
      notifyError('No se pudo recalcular la ruta con esa parada', 'stop-update-error');
    }
  };

  const removeStop = async (stopId) => {
    const nextForm = {
      ...routeForm,
      stops: (Array.isArray(routeForm.stops) ? routeForm.stops : []).filter((stop) => stop.id !== stopId)
    };

    setRouteForm(nextForm);
    setRouteResult(null);
    setSummaryOpen(false);
    closeStopEditor();

    if (!hasOrigin(nextForm) || !hasDestination(nextForm)) {
      setRouteResult(null);
      setSummaryOpen(false);
      return;
    }

    try {
      await refreshRoute(nextForm);
      notifySuccess('Parada eliminada', 'stop-removed');
    } catch (error) {
      if (isStaleRouteError(error)) return;
      notifyError('No se pudo recalcular al quitar la parada', 'stop-remove-error');
    }
  };

  const handleStopSearch = async (event) => {
    event.preventDefault();
    const value = stopQuery.trim();
    if (!value) return;

    if (stopSuggestions.length) {
      await applyStop(stopSuggestions[0]);
      return;
    }

    setStopSearching(true);
    try {
      const result = await fetchGeocode(value);
      await applyStop({
        name: result.display_name,
        detail: result.engine,
        lat: result.lat,
        lng: result.lng
      });
    } catch {
      notifyError('Parada no encontrada. Prueba con nombre o coordenadas', 'stop-not-found');
    } finally {
      setStopSearching(false);
    }
  };

  const handleDestinationSearch = async (event) => {
    event.preventDefault();
    const value = destinationQuery.trim();
    if (!value) return;

    if (destinationSuggestions.length) {
      await applyDestination(destinationSuggestions[0]);
      return;
    }

    setDestinationSearching(true);
    try {
      const result = await fetchGeocode(value);
      await applyDestination({
        name: result.display_name,
        detail: result.engine,
        lat: result.lat,
        lng: result.lng
      });
    } catch {
      notifyError('Destino no encontrado. Prueba con nombre o coordenadas', 'destination-inline-not-found');
    } finally {
      setDestinationSearching(false);
    }
  };

  const handleOriginSearch = async (event) => {
    event.preventDefault();
    const value = originQuery.trim();
    if (!value) return;

    if (originSuggestions.length) {
      await applyOrigin(originSuggestions[0]);
      return;
    }

    setOriginSearching(true);
    try {
      const result = await fetchGeocode(value);
      await applyOrigin({
        name: result.display_name,
        detail: result.engine,
        lat: result.lat,
        lng: result.lng
      });
    } catch {
      notifyError('Punto de partida no encontrado. Prueba con nombre o coordenadas', 'origin-not-found');
    } finally {
      setOriginSearching(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    if (searchSuggestions.length) {
      await applyDestination(searchSuggestions[0]);
      return;
    }

    setSearching(true);
    try {
      const result = await fetchGeocode(value);
      await applyDestination({
        name: result.display_name,
        detail: result.engine,
        lat: result.lat,
        lng: result.lng
      });
    } catch {
      notifyError('Destino no encontrado. Prueba con nombre o coordenadas', 'destination-not-found');
    } finally {
      setSearching(false);
    }
  };

  return {
    applyDestination,
    applyOrigin,
    applyStop,
    destinationEditing,
    destinationQuery,
    destinationSearching,
    destinationSuggestions,
    handleDestinationSearch,
    handleOriginSearch,
    handleSearch,
    handleStopSearch,
    closeStopEditor,
    openAddStop,
    openEditStop,
    originEditing,
    originQuery,
    originSearching,
    originSuggestions,
    query,
    searchOpen,
    searching,
    searchSuggestions,
    stopEditingId,
    stopQuery,
    stopSearching,
    stopSuggestions,
    removeStop,
    setDestinationEditing,
    setDestinationQuery,
    setDestinationSuggestions,
    setOriginEditing,
    setOriginQuery,
    setOriginSuggestions,
    setQuery,
    setSearchOpen,
    setStopQuery
  };
}
