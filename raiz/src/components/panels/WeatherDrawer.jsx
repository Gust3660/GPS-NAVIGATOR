import { CloudRain, CloudSun, Droplets, Navigation, RefreshCw, Thermometer, Wind, X } from 'lucide-react';
import { cx, drawerClass, drawerCloseClass, drawerHeadClass, labelTextClass, panelCardClass, softButtonClass } from '../ui/classes.js';

function formatValue(value, suffix, digits = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Sin dato';
  return `${number.toFixed(digits)}${suffix}`;
}

export default function WeatherDrawer({ weather, loading, error, onRefresh, onClose }) {
  return (
    <section className={drawerClass} aria-label="Clima actual">
      <div className={drawerHeadClass}>
        <button type="button" className={drawerCloseClass} onClick={onClose} aria-label="Cerrar clima"><X size={20} /></button>
        <strong>Clima actual</strong>
        <button
          type="button"
          className={cx(drawerCloseClass, 'ml-auto')}
          onClick={onRefresh}
          disabled={loading}
          aria-label="Actualizar clima"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className={cx(panelCardClass, 'mb-3 text-sm text-red-600 dark:text-red-300')}>
          {error}
        </div>
      )}

      {!weather && !error && (
        <div className={panelCardClass}>
          <span className={labelTextClass}>{loading ? 'Consultando ubicacion y clima...' : 'Sin lectura activa'}</span>
        </div>
      )}

      {weather && (
        <div className="grid gap-3">
          <div className={cx(panelCardClass, 'grid grid-cols-[52px_1fr] items-center gap-3')}>
            <div className="grid size-13 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-yellow-300 dark:text-slate-950">
              <CloudSun size={30} />
            </div>
            <div>
              <span className={labelTextClass}>{weather.source}</span>
              <strong className="block text-3xl">{formatValue(weather.temperature_c, '°C', 1)}</strong>
              <small className="text-slate-500">{weather.condition}</small>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={Thermometer} label="Sensacion" value={formatValue(weather.apparent_temperature_c, '°C', 1)} />
            <Metric icon={Droplets} label="Humedad" value={formatValue(weather.humidity_percent, '%')} />
            <Metric icon={CloudRain} label="Precipitacion" value={formatValue(weather.precipitation_mm, ' mm', 1)} />
            <Metric icon={Wind} label="Viento" value={formatValue(weather.wind_speed_kmh, ' km/h')} />
          </div>

          <div className={panelCardClass}>
            <span className={labelTextClass}>Direccion del viento</span>
            <strong className="mt-1 flex items-center gap-2 text-lg">
              <Navigation
                size={20}
                className="text-emerald-500"
                style={{ transform: `rotate(${Number(weather.wind_direction_degrees || 0)}deg)` }}
              />
              {formatValue(weather.wind_direction_degrees, '°')}
            </strong>
            <small className="text-slate-500">Rafagas {formatValue(weather.wind_gusts_kmh, ' km/h')}</small>
          </div>

          <div className={panelCardClass}>
            <span className={labelTextClass}>Ubicacion</span>
            <strong className="block">{Number(weather.lat).toFixed(5)}, {Number(weather.lng).toFixed(5)}</strong>
            <small className="text-slate-500">{weather.time} · {weather.timezone}</small>
          </div>

          <button type="button" className={softButtonClass} onClick={onRefresh} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className={panelCardClass}>
      <Icon size={20} className="mb-2 text-emerald-500 dark:text-yellow-300" />
      <span className={labelTextClass}>{label}</span>
      <strong className="block text-lg">{value}</strong>
    </div>
  );
}
