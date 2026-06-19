export const CURRENT_LOCATION_LABEL = 'Mi ubicacion';

const LEGACY_CURRENT_LOCATION_LABELS = new Set(['Mi ubicacion real', 'Mi ubicación real']);

export function normalizeOriginName(originName) {
  return LEGACY_CURRENT_LOCATION_LABELS.has(originName) ? CURRENT_LOCATION_LABEL : originName;
}

export function buildPayload(form, vehicleConfig = {}) {
  const stops = Array.isArray(form.stops)
    ? form.stops
        .map((stop) => ({
          lat: Number(stop.lat),
          lng: Number(stop.lng),
          name: stop.name || stop.display_name || 'Parada'
        }))
        .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng))
    : [];

  return {
    origin_lat: Number(form.origin_lat),
    origin_lng: Number(form.origin_lng),
    dest_lat: Number(form.dest_lat),
    dest_lng: Number(form.dest_lng),
    stops,
    vehicle_consumption: Number(form.vehicle_consumption),
    fuel_price_per_liter: Number(form.fuel_price_per_liter || 23.5),
    toll_cost_mxn: Number(form.toll_cost_mxn),
    avoid_tolls: form.avoid_tolls,
    avoid_highways: form.avoid_highways,
    vehicle_type: vehicleConfig.vehicle || 'Auto'
  };
}

export function formatCoord(lat, lng) {
  if (String(lat ?? '').trim() === '' || String(lng ?? '').trim() === '') {
    return 'Sin coordenadas';
  }
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
    return 'Sin coordenadas';
  }
  return `${parsedLat.toFixed(6)}, ${parsedLng.toFixed(6)}`;
}

export function formatDeviceTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function clampBatteryLevel(value) {
  return Math.min(Math.max(Number(value) || 0, 0), 100);
}
