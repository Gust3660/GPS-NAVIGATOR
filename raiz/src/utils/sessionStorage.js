import { normalizeOriginName } from './routeUtils.js';

const STORAGE_KEY = 'gps-location-session-v2';

const DEFAULT_SESSION = {
  theme: 'light',
  mapLayer: 'standard',
  originName: 'Obteniendo ubicacion',
  destinationName: 'Selecciona destino',
  routeForm: null,
  vehicleConfig: null
};

export function loadSessionSettings() {
  if (typeof window === 'undefined') return DEFAULT_SESSION;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SESSION;

    const vehicleConfig = parsed.vehicleConfig && typeof parsed.vehicleConfig === 'object' ? parsed.vehicleConfig : null;
    if (vehicleConfig?.batteryLevel === '82') {
      vehicleConfig.batteryLevel = '';
    }
    if (vehicleConfig?.efficiency === '5.5') {
      vehicleConfig.efficiency = '';
    }

    const routeForm = parsed.routeForm && typeof parsed.routeForm === 'object' ? parsed.routeForm : null;
    if (routeForm?.fuel_price_per_liter === '23.5') {
      routeForm.fuel_price_per_liter = '';
    }

    return {
      ...DEFAULT_SESSION,
      ...parsed,
      originName: normalizeOriginName(parsed.originName ?? DEFAULT_SESSION.originName),
      routeForm,
      vehicleConfig
    };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function saveSessionSettings(settings) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...settings,
        originName: normalizeOriginName(settings.originName)
      })
    );
  } catch {
    // Storage can be unavailable in private modes; keep the app usable.
  }
}
