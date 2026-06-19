import { X } from 'lucide-react';
import { cx, drawerClass, drawerCloseClass, drawerHeadClass, inputClass, labelTextClass, panelCardClass } from '../ui/classes.js';

function SwitchPill({ checked }) {
  return (
    <span
      className={cx(
        'relative inline-flex h-10 w-24 shrink-0 items-center rounded-full p-1 text-xs font-black text-white transition',
        checked ? 'bg-emerald-500' : 'bg-red-500'
      )}
      aria-hidden="true"
    >
      <span className={cx('absolute left-3 transition-opacity', checked ? 'opacity-100' : 'opacity-0')}>ON</span>
      <span className={cx('absolute right-3 transition-opacity', checked ? 'opacity-0' : 'opacity-100')}>OFF</span>
      <span
        className={cx(
          'absolute left-1 size-8 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-14'
        )}
      />
    </span>
  );
}

export default function RouteOptionsDrawer({
  routeForm,
  tollCost,
  routeResult,
  isElectricVehicle,
  onClose,
  onUpdateRouteOption
}) {
  const tollUnavailable = routeResult && routeResult.toll_cost_mxn == null;
  const tollValue = Number(tollCost || 0);

  return (
    <section className={drawerClass} aria-label="Opciones de ruta">
      <div className={drawerHeadClass}>
        <button type="button" className={drawerCloseClass} onClick={onClose} aria-label="Cerrar opciones de ruta"><X size={20} /></button>
        <strong>Opciones de ruta</strong>
      </div>

      <div className="grid gap-4">
        <p className="text-xs font-semibold text-slate-500">
          Nota: se recalcula segun la configuracion de ruta del usuario.
        </p>

        <label className={cx(panelCardClass, 'grid gap-3')}>
          <div>
            <strong className="block">Evitar peajes</strong>
            <small className="text-slate-500">Recalcula excluyendo tramos con caseta de cobro.</small>
          </div>
          <input className="sr-only" type="checkbox" checked={routeForm.avoid_tolls} onChange={(event) => onUpdateRouteOption('avoid_tolls', event.target.checked)} />
          <SwitchPill checked={routeForm.avoid_tolls} />
        </label>

        <label className={cx(panelCardClass, 'grid gap-3')}>
          <div>
            <strong className="block">Evitar autopistas</strong>
            <small className="text-slate-500">Recalcula excluyendo autopistas cuando el motor vial lo permite.</small>
          </div>
          <input className="sr-only" type="checkbox" checked={routeForm.avoid_highways} onChange={(event) => onUpdateRouteOption('avoid_highways', event.target.checked)} />
          <SwitchPill checked={routeForm.avoid_highways} />
        </label>

        {!routeForm.avoid_tolls && (
          <div className={panelCardClass}>
            <span className={labelTextClass}>
              Costo real de casetas
            </span>
            <strong className="block text-xl text-emerald-500">
              {!routeResult ? 'Pendiente' : tollUnavailable ? 'No disponible' : tollValue <= 0 ? 'Sin casetas' : `$${tollValue.toFixed(2)}`}
            </strong>
            <small className="text-slate-500">
              {routeResult?.toll_corridors?.length
                ? routeResult.toll_corridors.join(', ')
                : tollUnavailable
                  ? 'INEGI Sakbe no regreso costo real para esta ruta'
                  : 'INEGI Sakbe no reporto casetas en esta ruta'}
            </small>
          </div>
        )}

        {!isElectricVehicle && (
          <label className="grid gap-2">
            <span className={labelTextClass}>Precio combustible</span>
            <input className={inputClass} type="number" min="0" step="0.1" value={routeForm.fuel_price_per_liter} onChange={(event) => onUpdateRouteOption('fuel_price_per_liter', event.target.value)} />
            <small className="text-slate-500">MXN/L</small>
          </label>
        )}
      </div>
    </section>
  );
}
