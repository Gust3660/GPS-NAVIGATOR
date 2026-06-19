import { useMemo } from 'react';
import { electricRangeKm } from '../data/routeData.js';
import { hasDestination, hasOrigin } from '../utils/routeGuards.js';
import { normalizeOriginName } from '../utils/routeUtils.js';
import { formatInstructionDistance } from '../utils/navigationUtils.js';

export function useRouteDerivedState({
  routeForm,
  routeResult,
  alerts,
  recentRoutes,
  vehicleConfig,
  destinationName
}) {
  const origin = useMemo(() => {
    if (!hasOrigin(routeForm)) return null;
    return {
      lat: Number(routeForm.origin_lat),
      lng: Number(routeForm.origin_lng)
    };
  }, [routeForm]);

  const destination = useMemo(() => {
    if (!hasDestination(routeForm)) return null;
    return {
      lat: Number(routeForm.dest_lat),
      lng: Number(routeForm.dest_lng)
    };
  }, [routeForm]);

  const duration = routeResult?.duration_minutes ?? 0;
  const distance = routeResult?.distance_km ?? 0;
  const fuelLiters = routeResult?.fuel_consumption_liters ?? 0;
  const tollCost = routeResult?.toll_cost_mxn ?? null;
  const riskScore = routeResult?.risk_score ?? 0;
  const redZoneCount = routeResult?.red_zones?.length ?? 0;
  const avoidedZoneCount = routeResult?.avoided_zones?.length ?? 0;
  const trafficLevel = routeResult?.traffic_level ?? 'normal';
  const trafficSource = routeResult?.optimization?.traffic_source === 'google_routes' ? 'Google' : 'local';
  const isElectricVehicle = vehicleConfig.vehicle === 'Electrico';
  const hasBatteryLevel = vehicleConfig.batteryLevel !== '' && vehicleConfig.batteryLevel != null;
  const initialBatteryLevel = hasBatteryLevel ? Math.min(Math.max(Number(vehicleConfig.batteryLevel) || 0, 0), 100) : 0;
  const batteryUsed = isElectricVehicle ? Math.min((distance / electricRangeKm) * 100, initialBatteryLevel) : 0;
  const estimatedBatteryLevel = Math.max(initialBatteryLevel - batteryUsed, 0);

  const frequentPlaces = useMemo(() => {
    const seen = new Set();
    return recentRoutes
      .filter((route) => route?.destination?.lat && route?.destination?.lng)
      .filter((route) => {
        const key = `${route.name}-${route.destination.lat}-${route.destination.lng}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6)
      .map((route) => {
        const originName = normalizeOriginName(route.originName);

        return {
          name: route.name || 'Destino usado',
          detail: originName ? `Desde ${originName}` : 'Usado recientemente',
          lat: route.destination.lat,
          lng: route.destination.lng,
          display_name: route.name || 'Destino usado'
        };
      });
  }, [recentRoutes]);

  const routeSteps = useMemo(() => {
    const steps = routeResult?.route_steps ?? [];
    if (!steps.length) return [];

    return steps.map((step, index) => ({
      title: step.instruction || (index === steps.length - 1 ? `Llegar a ${destinationName}` : 'Continua'),
      detail: [
        step.street && step.street !== 'vialidad sin nombre' ? step.street : null,
        Number.isFinite(Number(step.distance_meters)) ? formatInstructionDistance(Number(step.distance_meters)) : null
      ].filter(Boolean).join(' · ')
    }));
  }, [destinationName, routeResult?.route_steps]);

  return {
    origin,
    destination,
    duration,
    distance,
    fuelLiters,
    tollCost,
    riskScore,
    redZoneCount,
    avoidedZoneCount,
    trafficLevel,
    trafficSource,
    isElectricVehicle,
    batteryUsed,
    estimatedBatteryLevel,
    frequentPlaces,
    routeSteps
  };
}
