import { useCallback, useRef } from 'react';
import { fetchRoute, saveRecentRoute } from '../services/api.js';
import { buildPayload } from '../utils/routeUtils.js';
import { hasDestination, hasOrigin, hasRouteEndpoints } from '../utils/routeGuards.js';
import { notifySuccess } from '../utils/notify.js';

function getRouteRequestKey(payload) {
  return JSON.stringify({
    origin_lat: payload.origin_lat,
    origin_lng: payload.origin_lng,
    dest_lat: payload.dest_lat,
    dest_lng: payload.dest_lng,
    stops: payload.stops.map((stop) => [stop.lat, stop.lng]),
    vehicle_consumption: payload.vehicle_consumption,
    fuel_price_per_liter: payload.fuel_price_per_liter,
    toll_cost_mxn: payload.toll_cost_mxn,
    avoid_tolls: Boolean(payload.avoid_tolls),
    avoid_highways: Boolean(payload.avoid_highways),
    vehicle_type: payload.vehicle_type
  });
}

function createStaleRouteError() {
  const error = new Error('Ruta reemplazada por un calculo mas reciente');
  error.isStaleRoute = true;
  return error;
}

export function isStaleRouteError(error) {
  return Boolean(error?.isStaleRoute);
}

export function useRouteController({
  routeForm,
  setRouteResult,
  destinationName,
  originName,
  vehicleConfig
}) {
  const activeRouteKeyRef = useRef('');
  const activeRouteAbortRef = useRef(null);

  const rememberRecentRoute = useCallback(async (form, data, name = destinationName) => {
    if (!hasRouteEndpoints(form)) return;

    const recentRoute = {
      name,
      originName,
      origin: { lat: Number(form.origin_lat), lng: Number(form.origin_lng) },
      destination: { lat: Number(form.dest_lat), lng: Number(form.dest_lng) },
      form,
      distance: data?.distance_km ?? 0,
      duration: data?.duration_minutes ?? 0,
      tollCost: data?.toll_cost_mxn ?? 0,
      vehicle: vehicleConfig.vehicle
    };

    try {
      await saveRecentRoute(recentRoute);
    } catch {
      // Recent routes are helpful history, not critical path.
    }
  }, [destinationName, originName, vehicleConfig.vehicle]);

  const refreshRoute = useCallback(async (form = routeForm, silent = false, remember = true, options = {}) => {
    const { clearBeforeFetch = true } = options;

    if (!hasOrigin(form)) {
      setRouteResult(null);
      throw new Error('Obten tu ubicacion real o selecciona un punto de partida');
    }
    if (!hasDestination(form)) {
      setRouteResult(null);
      throw new Error('Selecciona un destino para calcular la ruta');
    }

    const payload = buildPayload(form, options.vehicleConfigOverride || vehicleConfig);
    const requestKey = getRouteRequestKey(payload);

    if (activeRouteKeyRef.current && activeRouteKeyRef.current !== requestKey) {
      activeRouteAbortRef.current?.abort();
    }
    activeRouteKeyRef.current = requestKey;

    if (clearBeforeFetch) {
      setRouteResult(null);
    }

    const controller = new AbortController();
    activeRouteAbortRef.current = controller;

    try {
      const data = await fetchRoute(payload, { signal: controller.signal });
      if (activeRouteKeyRef.current !== requestKey) {
        throw createStaleRouteError();
      }

      setRouteResult(data);
      if (remember) rememberRecentRoute(form, data).catch(() => {});
      if (!silent) notifySuccess('Ruta actualizada', 'route-updated');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw createStaleRouteError();
      }
      throw error;
    } finally {
      if (activeRouteAbortRef.current === controller) {
        activeRouteAbortRef.current = null;
      }
    }
  }, [rememberRecentRoute, routeForm, setRouteResult, vehicleConfig]);

  return {
    rememberRecentRoute,
    refreshRoute
  };
}
