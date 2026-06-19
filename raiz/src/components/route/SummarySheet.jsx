import { Bookmark, Clock3, Fuel, List, Navigation, Route, ShieldAlert, Ticket, Zap } from 'lucide-react';
import { cx, softButtonClass } from '../ui/classes.js';

function MetricTile({ icon: Icon, label, value, tone = 'emerald' }) {
  const toneClass = tone === 'amber'
    ? 'bg-amber-400/12 text-amber-500 ring-amber-400/25 dark:text-yellow-300'
    : 'bg-emerald-400/12 text-emerald-500 ring-emerald-400/25 dark:text-emerald-300';

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-white dark:border-white/10 dark:bg-slate-900 dark:ring-white/10">
      <div className={cx('mb-3 grid size-10 place-items-center rounded-2xl ring-1', toneClass)}>
        <Icon size={21} strokeWidth={2.3} />
      </div>
      <strong className="block truncate text-xl font-black leading-tight text-slate-950 dark:text-white">{value}</strong>
      <span className="mt-1 block truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-white/10">
      <b className={cx('size-2.5 shrink-0 rounded-full', color)} />
      <span className="truncate">{label}</span>
    </span>
  );
}

export default function SummarySheet({
  dragging,
  offset,
  onStartDrag,
  duration,
  distance,
  isElectricVehicle,
  estimatedBatteryLevel,
  fuelLiters,
  tollCost,
  routeResult,
  riskScore,
  redZoneCount,
  trafficLevel,
  trafficSource,
  alertsCount,
  avoidedZoneCount,
  navigationActive,
  onStartNavigation,
  onOpenSteps,
  onSaveRoute,
  onOpenTollDetail
}) {
  const tollUnavailable = routeResult && routeResult.toll_cost_mxn == null;
  const tollValue = Number(tollCost || 0);
  const tollDisplay = routeResult
    ? tollUnavailable
      ? 'No disponible'
      : tollValue > 0
      ? `$${tollValue.toFixed(2)}`
      : 'Sin casetas'
    : 'Pendiente';
  const tollLabel = 'Casetas reales';
  const riskValue = Math.max(0, Math.min(Number(riskScore) || 0, 100));
  const unresolvedCount = routeResult?.unresolved_zones?.length ?? 0;
  const riskLabel = riskValue >= 70 ? 'Alto' : riskValue >= 45 ? 'Medio' : 'Controlado';

  return (
    <section
      className={cx(
        'fixed bottom-0 left-1/2 z-30 max-h-[78vh] w-[min(1040px,calc(100vw-140px))] -translate-x-1/2 overflow-auto rounded-t-[24px] border border-b-0 border-white bg-slate-50 p-5 text-slate-950 shadow-uber dark:border-white/10 dark:bg-slate-950 dark:text-slate-50 max-[780px]:w-[calc(100vw-1rem)] max-[780px]:p-4',
        dragging ? 'select-none' : ''
      )}
      style={{ transform: `translate(-50%, ${-offset}px)` }}
    >
      <button
        type="button"
        className="mx-auto mb-4 block h-1.5 w-12 rounded-full bg-slate-300 transition hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500"
        onPointerDown={onStartDrag}
        aria-label="Mover panel de resumen"
      />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-yellow-300">Ruta lista</span>
          <h2 className="mt-1 text-2xl font-black leading-tight">Resumen de la ruta</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
          Riesgo {riskLabel}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2">
        <MetricTile icon={Clock3} label="Tiempo estimado" value={`${Math.round(duration)} min`} tone="amber" />
        <MetricTile icon={Route} label="Distancia" value={`${distance.toFixed(1)} km`} tone="amber" />
        {isElectricVehicle ? (
          <MetricTile icon={Zap} label="Bateria al llegar" value={`${estimatedBatteryLevel.toFixed(0)}%`} />
        ) : (
          <MetricTile icon={Fuel} label="Combustible estimado" value={`${fuelLiters.toFixed(2)} L`} />
        )}
        <MetricTile icon={Ticket} label={tollLabel} value={tollDisplay} />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_1.15fr] gap-3 max-[860px]:grid-cols-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black">{tollUnavailable ? 'Costo real no disponible' : 'Casetas verificadas por INEGI Sakbe'}</p>
              <strong className="mt-1 block text-2xl font-black text-emerald-500">{tollDisplay === 'No disponible' ? tollDisplay : Number(tollCost) > 0 ? `$${Number(tollCost).toFixed(2)} MXN` : 'Sin casetas'}</strong>
            </div>
            <Ticket className="shrink-0 text-emerald-500 dark:text-yellow-300" size={24} />
          </div>
          <button type="button" className={cx(softButtonClass, 'w-full rounded-xl')} onClick={onOpenTollDetail}>Ver detalle</button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-red-400/12 text-red-500 ring-1 ring-red-400/25">
                <ShieldAlert size={21} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">Indice de riesgo de la ruta</p>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Puntos rojos evitados automaticamente</span>
              </div>
            </div>
            <strong className="text-2xl font-black text-emerald-500">{riskValue}/100</strong>
          </div>

          <div className="relative my-4 h-5">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 via-orange-400 to-red-600 shadow-inner" />
            <div
              className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-emerald-500/35"
              style={{ width: `${riskValue}%` }}
            />
            <span
              className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-lg ring-2 ring-slate-950/10 transition-[left] duration-500 dark:bg-white dark:ring-white/10"
              style={{ left: `calc(${riskValue}% * 0.98 + 1%)` }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <LegendItem color="bg-red-400" label={`Zonas rojas ${redZoneCount}`} />
            <LegendItem color="bg-emerald-400" label={`Evitadas ${avoidedZoneCount}`} />
            <LegendItem color="bg-yellow-400" label={`Sin evitar ${unresolvedCount}`} />
            <LegendItem color="bg-orange-400" label={`Trafico ${trafficLevel}`} />
            <LegendItem color="bg-slate-400" label={`Alertas ${alertsCount || 0}`} />
            <LegendItem color="bg-blue-400" label={trafficSource || 'local'} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[2fr_1.1fr_1.1fr] gap-3 max-[760px]:grid-cols-1">
        <button type="button" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-5 font-black text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:bg-emerald-600 dark:bg-yellow-300 dark:text-slate-950 dark:hover:bg-yellow-200" onClick={onStartNavigation}>
          <Navigation size={24} />{navigationActive ? 'Detener navegacion' : 'Iniciar navegacion'}
        </button>
        <button type="button" className={softButtonClass} onClick={onOpenSteps}><List size={23} />Pasos</button>
        <button type="button" className={softButtonClass} onClick={onSaveRoute}><Bookmark size={22} />Guardar</button>
      </div>
    </section>
  );
}
