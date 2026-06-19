import { ChevronDown, ChevronUp, Layers, LocateFixed, MoveRight, X } from 'lucide-react';
import { cx } from '../ui/classes.js';
import { formatInstructionDistance } from '../../utils/navigationUtils.js';

export default function NavigationHud({
  maneuver,
  arrivalTime,
  remainingMinutes,
  remainingKm,
  traveledKm,
  progressPercent,
  speedKmh,
  navigationMode,
  detailsOpen,
  totalDistanceKm,
  tollCost,
  riskScore,
  mapLayer,
  compassActive,
  compassAvailable,
  compassHeading,
  onToggleLayer,
  onToggleCompass,
  onRecenter,
  onZoom,
  onToggleDetails,
  onStop
}) {
  const TurnIcon = maneuver?.type === 'left' ? TurnLeftIcon : maneuver?.type === 'right' ? TurnRightIcon : MoveRight;
  const headingLabel = Number.isFinite(compassHeading) ? `${Math.round(compassHeading)} grados` : 'sin lectura';
  const progressValue = Math.max(0, Math.min(Number(progressPercent) || 0, 100));
  const modeLabel = 'GPS real';
  const tollDisplay = tollCost == null ? 'N/D' : `$${Number(tollCost || 0).toFixed(0)}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div className="absolute left-3 top-3 w-[min(520px,calc(100vw-1.5rem))] overflow-hidden rounded-3xl bg-emerald-700 text-white shadow-2xl ring-1 ring-white/15 dark:bg-emerald-800">
        <div className="flex items-start gap-4">
          <TurnIcon className="ml-5 mt-5 size-16 shrink-0 text-white" strokeWidth={3.4} />
          <div className="min-w-0">
            <strong className="mt-6 block text-4xl leading-tight max-[560px]:text-3xl">{maneuver?.label || 'Continua'}</strong>
            <b className="mb-5 block truncate text-lg text-white/90">
              {formatInstructionDistance(maneuver?.distance ?? 0)} · {maneuver?.detail || 'Sigue sobre la ruta marcada'}
            </b>
          </div>
        </div>
        <div className="flex w-fit items-center gap-3 rounded-tr-3xl bg-emerald-800 px-6 py-4 text-white dark:bg-emerald-900">
          <span className="text-2xl">Luego</span>
          <ArrowLane active={maneuver?.type === 'straight'} />
          <ArrowLane active={maneuver?.type === 'left'} direction="left" />
          <ArrowLane active={maneuver?.type === 'right'} direction="right" />
        </div>
      </div>

      <div className="absolute right-4 top-4 grid gap-3">
        <div className="grid size-20 place-items-center rounded-full border-4 border-red-600 bg-white text-slate-950 shadow-xl dark:border-yellow-300 dark:bg-slate-950 dark:text-yellow-300">
          <strong className="text-3xl leading-none">{Math.round(speedKmh || 0)}</strong>
          <span className="-mt-2 text-xs font-bold text-slate-950 dark:text-yellow-200">km/h</span>
        </div>
        <button
          type="button"
          className={cx(
            'pointer-events-auto grid size-16 place-items-center rounded-full border border-white/70 bg-white/45 p-1 text-slate-950 shadow-xl shadow-slate-900/20 ring-1 ring-white/70 backdrop-blur-2xl transition hover:bg-white/65 active:bg-emerald-500/70 dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:ring-white/15 dark:hover:bg-slate-900/65',
            compassActive && 'ring-2 ring-emerald-400 dark:ring-emerald-300',
            compassAvailable === false && 'opacity-70'
          )}
          onClick={onToggleCompass}
          aria-label={`Brujula ${compassActive ? 'activa' : 'inactiva'}: ${headingLabel}`}
          title={compassAvailable === false ? 'Brujula no disponible en este dispositivo' : `Brujula: ${headingLabel}`}
        >
          <CompassIcon heading={compassHeading || 0} active={compassActive} />
        </button>
        <button
          type="button"
          className="pointer-events-auto grid size-16 place-items-center rounded-full border border-white/70 bg-white/45 text-slate-950 shadow-xl shadow-slate-900/20 ring-1 ring-white/70 backdrop-blur-2xl transition hover:bg-white/65 active:bg-emerald-500/70 active:text-white dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:ring-white/15 dark:hover:bg-slate-900/65 dark:active:bg-yellow-300/80 dark:active:text-slate-950"
          onClick={onToggleLayer}
          aria-label={mapLayer === 'satellite' ? 'Cambiar a mapa estandar' : 'Cambiar a satelite'}
          title={mapLayer === 'satellite' ? 'Mapa' : 'Satelite'}
        >
          <Layers className="size-8" />
        </button>
        <div className="flex h-36 w-16 flex-col items-center justify-between rounded-full border border-white/70 bg-white/45 py-4 text-slate-800 shadow-[0_18px_46px_rgba(15,23,42,0.25)] ring-1 ring-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:ring-white/15 max-[680px]:h-40 max-[680px]:w-[4.5rem]">
          <button type="button" className="pointer-events-auto grid size-11 place-items-center rounded-full text-4xl font-light leading-none transition hover:bg-white/65 active:bg-emerald-500/70 active:text-white dark:hover:bg-slate-900/65 dark:active:bg-yellow-300/80 dark:active:text-slate-950 max-[680px]:size-12" aria-label="Acercar mapa" title="Acercar mapa" onClick={() => onZoom?.('in')}>+</button>
          <button type="button" className="pointer-events-auto grid size-11 place-items-center rounded-full text-4xl font-light leading-none transition hover:bg-white/65 active:bg-emerald-500/70 active:text-white dark:hover:bg-slate-900/65 dark:active:bg-yellow-300/80 dark:active:text-slate-950 max-[680px]:size-12" aria-label="Alejar mapa" title="Alejar mapa" onClick={() => onZoom?.('out')}>−</button>
        </div>
      </div>

      <button
        type="button"
        className="pointer-events-auto absolute bottom-28 left-7 inline-flex min-h-14 items-center gap-3 rounded-full border border-white/70 bg-white/45 px-6 text-lg font-black text-emerald-700 shadow-2xl shadow-slate-900/15 ring-1 ring-white/70 backdrop-blur-2xl transition hover:bg-white/65 active:bg-emerald-500/70 active:text-white dark:border-white/10 dark:bg-slate-950/40 dark:text-yellow-300 dark:ring-white/15 dark:hover:bg-slate-900/65 dark:active:bg-yellow-300/80 dark:active:text-slate-950 max-[680px]:bottom-44"
        onClick={onRecenter}
        title="Centrar en mi ubicacion"
      >
        <LocateFixed className="size-7" /> Centrar
      </button>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[28px] bg-white text-slate-950 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-950 dark:text-white dark:ring-slate-800">
        {detailsOpen && (
          <div className="grid grid-cols-4 gap-3 border-b border-slate-200 px-6 py-4 text-center dark:border-slate-800 max-[760px]:grid-cols-2">
            <Detail value={`${Number(totalDistanceKm || 0).toFixed(1)} km`} label="Ruta total" />
            <Detail value={`${Number(traveledKm || 0).toFixed(1)} km`} label="Recorrido" />
            <Detail value={tollDisplay} label="Casetas" />
            <Detail value={`${riskScore || 0}/100`} label="Riesgo" />
          </div>
        )}
        <div className="border-b border-slate-200 px-6 py-3 dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span>Progreso de ruta</span>
            <span>{Math.round(progressValue)}% · {modeLabel}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500 dark:bg-yellow-300" style={{ width: `${progressValue}%` }} />
          </div>
        </div>
        <div className="flex items-center">
          <button type="button" className="pointer-events-auto m-5 grid size-16 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100 active:bg-emerald-500 active:text-white dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-yellow-300 dark:active:text-slate-950" onClick={onStop} aria-label="Detener navegacion">
            <X size={24} />
          </button>
          <div className="grid flex-1 grid-cols-3 items-center text-center">
            <Metric value={arrivalTime} label="Llegada" />
            <Metric value={Math.max(1, Math.round(remainingMinutes))} label="min" />
            <Metric value={remainingKm.toFixed(1)} label="km" />
          </div>
          <button
            type="button"
            className="pointer-events-auto mx-5 grid size-12 shrink-0 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 active:bg-emerald-500 active:text-white dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-yellow-300 dark:active:text-slate-950"
            onClick={onToggleDetails}
            aria-label={detailsOpen ? 'Ocultar detalles de navegacion' : 'Mostrar detalles de navegacion'}
          >
            {detailsOpen ? <ChevronDown size={30} /> : <ChevronUp size={30} />}
          </button>
        </div>
      </div>

      <div className={cx(
        'absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold shadow-lg max-[680px]:bottom-36',
        'bg-emerald-500 text-white'
      )}>
        {`${Math.round(speedKmh || 0)} km/h`}
      </div>
    </div>
  );
}

function CompassIcon({ heading = 0, active = false }) {
  return (
    <span
      className="relative grid size-12 place-items-center rounded-full border border-white/70 bg-white/55 shadow-inner shadow-white/45 ring-1 ring-slate-200/70 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/30 dark:ring-white/15"
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400 dark:bg-slate-500" />
      <span
        className="absolute left-1/2 top-1/2 h-8 w-3.5 -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-transform duration-300"
        style={{ transform: `translate(-50%, -50%) rotate(${135 - heading}deg)` }}
      >
        <span className="absolute left-0 top-0 h-0 w-0 border-x-[7px] border-b-[17px] border-x-transparent border-b-slate-300 dark:border-b-slate-500" />
        <span className="absolute bottom-0 left-0 h-0 w-0 border-x-[7px] border-t-[17px] border-x-transparent border-t-red-500 dark:border-t-red-400" />
      </span>
      {active && <span className="absolute inset-0 rounded-full ring-2 ring-emerald-400/60 dark:ring-emerald-300/70" />}
    </span>
  );
}

function Metric({ value, label }) {
  return (
    <div className="py-5">
      <strong className="block text-3xl font-black leading-tight text-emerald-600 dark:text-yellow-300">{value}</strong>
      <span className="block text-base text-slate-500 dark:text-slate-300">{label}</span>
    </div>
  );
}

function Detail({ value, label }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
      <strong className="block text-lg font-black">{value}</strong>
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function ArrowLane({ active, direction = 'straight' }) {
  return (
    <span className={cx('text-3xl font-black leading-none', active ? 'text-white' : 'text-white/45')}>
      {direction === 'left' ? '↰' : direction === 'right' ? '↱' : '↑'}
    </span>
  );
}

function TurnRightIcon(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 54V28a12 12 0 0 1 12-12h21" />
      <path d="M42 7l10 9-10 9" />
    </svg>
  );
}

function TurnLeftIcon(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M46 54V28a12 12 0 0 0-12-12H13" />
      <path d="M22 7l-10 9 10 9" />
    </svg>
  );
}
