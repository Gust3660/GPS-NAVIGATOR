import { Layers, LocateFixed, Minus, Plus, ShieldPlus } from 'lucide-react';
import { cx, iconButtonClass } from '../ui/classes.js';

function MapControlButton({ children, className, label, title = label, ...props }) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={cx(iconButtonClass, className)}
        aria-label={label}
        title={title}
        {...props}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-xs font-black text-slate-950 opacity-0 shadow-xl shadow-slate-900/15 backdrop-blur-2xl transition group-hover:opacity-100 group-focus-within:opacity-100 dark:border-white/10 dark:bg-slate-950/85 dark:text-white dark:ring-1 dark:ring-white/10">
        {title}
      </span>
    </div>
  );
}

function ZoomPill({ onZoom }) {
  return (
    <div className="flex h-32 w-14 flex-col items-center justify-between rounded-[28px] border border-white/70 bg-white/45 py-4 text-slate-950 shadow-xl shadow-slate-900/15 ring-1 ring-white/65 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:text-white dark:ring-white/15">
      <div className="group relative">
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full transition hover:bg-white/65 active:bg-emerald-400/55 dark:hover:bg-slate-900/70 dark:active:bg-yellow-300/80 dark:active:text-slate-950"
          aria-label="Acercar mapa"
          title="Acercar mapa"
          onClick={() => onZoom('in')}
        >
          <Plus size={25} />
        </button>
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-xs font-black text-slate-950 opacity-0 shadow-xl shadow-slate-900/15 backdrop-blur-2xl transition group-hover:opacity-100 group-focus-within:opacity-100 dark:border-white/10 dark:bg-slate-950/85 dark:text-white dark:ring-1 dark:ring-white/10">
          Acercar mapa
        </span>
      </div>
      <div className="group relative">
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full transition hover:bg-white/65 active:bg-emerald-400/55 dark:hover:bg-slate-900/70 dark:active:bg-yellow-300/80 dark:active:text-slate-950"
          aria-label="Alejar mapa"
          title="Alejar mapa"
          onClick={() => onZoom('out')}
        >
          <Minus size={25} />
        </button>
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-xs font-black text-slate-950 opacity-0 shadow-xl shadow-slate-900/15 backdrop-blur-2xl transition group-hover:opacity-100 group-focus-within:opacity-100 dark:border-white/10 dark:bg-slate-950/85 dark:text-white dark:ring-1 dark:ring-white/10">
          Alejar mapa
        </span>
      </div>
    </div>
  );
}

function CompassIcon({ heading = 0, active = false }) {
  return (
    <span
      className="relative grid size-10 place-items-center rounded-full border border-white/70 bg-white/55 shadow-inner shadow-white/45 ring-1 ring-slate-200/70 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/30 dark:ring-white/15"
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400 dark:bg-slate-500" />
      <span
        className="absolute left-1/2 top-1/2 h-7 w-3 -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-transform duration-300"
        style={{ transform: `translate(-50%, -50%) rotate(${135 - heading}deg)` }}
      >
        <span className="absolute left-0 top-0 h-0 w-0 border-x-[6px] border-b-[15px] border-x-transparent border-b-slate-300 dark:border-b-slate-500" />
        <span className="absolute bottom-0 left-0 h-0 w-0 border-x-[6px] border-t-[15px] border-x-transparent border-t-red-500 dark:border-t-red-400" />
      </span>
      {active && <span className="absolute inset-0 rounded-full ring-2 ring-emerald-400/60 dark:ring-emerald-300/70" />}
    </span>
  );
}

export default function MapControls({
  mapLayer,
  locatingOrigin,
  compassActive,
  compassAvailable,
  compassHeading,
  redZonesOpen,
  onOpenRedZones,
  onToggleLayer,
  onLocateOrigin,
  onToggleCompass,
  onZoom
}) {
  const headingLabel = Number.isFinite(compassHeading) ? `${Math.round(compassHeading)} grados` : 'sin lectura';

  return (
    <div className="fixed right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3">
      <MapControlButton
        className={cx(redZonesOpen && 'bg-red-500 text-white ring-2 ring-red-200/80 dark:bg-red-500 dark:text-white dark:ring-red-300/40')}
        label="Administrar zonas rojas"
        title={redZonesOpen ? 'Cerrar zonas rojas' : 'Añadir o editar zonas rojas'}
        onClick={onOpenRedZones}
        aria-expanded={redZonesOpen}
      >
        <ShieldPlus size={25} />
      </MapControlButton>
      <MapControlButton
        className={cx(mapLayer === 'satellite' && 'bg-yellow-300/90 text-slate-950 ring-yellow-200/80 dark:bg-yellow-300/90 dark:text-slate-950 dark:ring-yellow-200/40')}
        onClick={onToggleLayer}
        label="Cambiar capa del mapa"
        title={mapLayer === 'satellite' ? 'Cambiar a mapa' : 'Cambiar a satelite'}
      >
        <Layers size={25} />
      </MapControlButton>
      <MapControlButton
        className={cx(locatingOrigin && 'opacity-60')}
        label="Usar mi ubicacion como punto de partida"
        title={locatingOrigin ? 'Obteniendo ubicacion' : 'Obtener ubicacion'}
        onClick={onLocateOrigin}
        disabled={locatingOrigin}
      >
        <LocateFixed size={25} />
      </MapControlButton>
      <MapControlButton
        className={cx(
          'p-1 text-slate-800 dark:text-white',
          compassActive && 'ring-2 ring-emerald-400 dark:ring-emerald-300',
          compassAvailable === false && 'opacity-70'
        )}
        label={`Brujula ${compassActive ? 'activa' : 'inactiva'}: ${headingLabel}`}
        title={compassAvailable === false ? 'Brujula no disponible en este dispositivo' : `Brujula: ${headingLabel}`}
        onClick={onToggleCompass}
      >
        <CompassIcon heading={compassHeading || 0} active={compassActive} />
      </MapControlButton>
      <ZoomPill onZoom={onZoom} />
    </div>
  );
}
