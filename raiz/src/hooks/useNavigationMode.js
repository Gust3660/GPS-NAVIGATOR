import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notifySuccess, notifyError } from '../utils/notify.js';
import { formatDeviceTime } from '../utils/routeUtils.js';
import {
  bearingDegrees,
  decodeRoutePolyline,
  nearestRouteProgress,
  nextManeuver,
  pointAtDistance,
  routeMetrics
} from '../utils/navigationUtils.js';

export function useNavigationMode({ routeResult, duration }) {
  const [navigationActive, setNavigationActive] = useState(false);
  const [navigationProgress, setNavigationProgress] = useState(0);
  const [navigationPosition, setNavigationPosition] = useState(null);
  const [navigationSpeed, setNavigationSpeed] = useState(0);
  const [navigationDetailsOpen, setNavigationDetailsOpen] = useState(false);
  const [navigationMode, setNavigationMode] = useState('gps');
  const navigationWatchRef = useRef(null);
  const navigationTimerRef = useRef(null);

  const routePoints = useMemo(() => decodeRoutePolyline(routeResult?.polyline), [routeResult?.polyline]);
  const routeNavMetrics = useMemo(() => routeMetrics(routePoints), [routePoints]);
  const vehiclePosition = navigationPosition;
  const vehicleAhead = pointAtDistance(routePoints, routeNavMetrics.cumulative, navigationProgress + 45);
  const vehicleHeading = vehiclePosition && vehicleAhead ? bearingDegrees(vehiclePosition, vehicleAhead) : 0;
  const remainingMeters = Math.max(routeNavMetrics.total - navigationProgress, 0);
  const remainingRatio = routeNavMetrics.total ? remainingMeters / routeNavMetrics.total : 1;
  const remainingMinutes = Math.max(0, duration * remainingRatio);
  const traveledMeters = Math.min(Math.max(navigationProgress, 0), routeNavMetrics.total || 0);
  const progressPercent = routeNavMetrics.total ? Math.min(100, Math.max(0, (traveledMeters / routeNavMetrics.total) * 100)) : 0;
  const navigationArrival = formatDeviceTime(new Date(Date.now() + remainingMinutes * 60000));
  const currentManeuver = useMemo(
    () => nextManeuver(routePoints, routeNavMetrics.cumulative, navigationProgress),
    [navigationProgress, routeNavMetrics.cumulative, routePoints]
  );

  const stopNavigationTracking = useCallback(() => {
    if (navigationWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(navigationWatchRef.current);
      navigationWatchRef.current = null;
    }
    if (navigationTimerRef.current !== null) {
      window.clearInterval(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!navigationActive) {
      stopNavigationTracking();
      return undefined;
    }

    if (!routePoints.length || !routeNavMetrics.total) {
      notifyError('No hay ruta calculada para navegar', 'navigation-no-route');
      setNavigationActive(false);
      return undefined;
    }

    if (!navigator.geolocation) {
      notifyError('La navegacion requiere ubicacion GPS real', 'navigation-gps-required');
      setNavigationActive(false);
      return undefined;
    }

    setNavigationMode('gps');
    setNavigationDetailsOpen(true);
    setNavigationPosition(null);
    navigationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const currentPosition = [position.coords.latitude, position.coords.longitude];
        const progress = nearestRouteProgress(routePoints, routeNavMetrics.cumulative, currentPosition);
        setNavigationPosition(currentPosition);
        setNavigationProgress(progress);
        setNavigationSpeed(Math.max(0, (position.coords.speed ?? 0) * 3.6));

        if (routeNavMetrics.total - progress < 25) {
          stopNavigationTracking();
          setNavigationActive(false);
          notifySuccess('Llegaste al destino', 'navigation-arrived');
        }
      },
      () => {
        notifyError('No se pudo iniciar navegacion con GPS real. Revisa el permiso de ubicacion', 'navigation-gps-error');
        stopNavigationTracking();
        setNavigationActive(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1200
      }
    );

    return () => {
      stopNavigationTracking();
    };
  }, [
    navigationActive,
    routeNavMetrics.cumulative,
    routeNavMetrics.total,
    routePoints,
    stopNavigationTracking
  ]);

  const resetNavigationStart = useCallback(() => {
    setNavigationProgress(0);
    setNavigationPosition(null);
    setNavigationSpeed(0);
    setNavigationDetailsOpen(true);
    setNavigationMode('gps');
  }, [routeNavMetrics.cumulative, routePoints]);

  const stopNavigation = useCallback(() => {
    stopNavigationTracking();
    setNavigationActive(false);
    setNavigationPosition(null);
    setNavigationDetailsOpen(false);
    setNavigationMode('gps');
  }, [stopNavigationTracking]);

  return {
    navigationActive,
    setNavigationActive,
    navigationProgress,
    traveledMeters,
    progressPercent,
    navigationSpeed,
    navigationMode,
    navigationDetailsOpen,
    setNavigationDetailsOpen,
    routePoints,
    routeNavMetrics,
    vehiclePosition,
    vehicleHeading,
    remainingMeters,
    remainingMinutes,
    navigationArrival,
    currentManeuver,
    resetNavigationStart,
    stopNavigation,
    stopNavigationTracking
  };
}
