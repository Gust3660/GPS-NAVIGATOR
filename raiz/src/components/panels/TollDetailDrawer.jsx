import { X } from 'lucide-react';
import { drawerClass, drawerCloseClass, drawerHeadClass, labelTextClass, panelCardClass } from '../ui/classes.js';

export default function TollDetailDrawer({ tollCost, routeResult, routeForm, onClose }) {
  const sourceLabel = routeResult?.toll_cost_verified
    ? 'INEGI Sakbe'
    : 'No disponible';
  const tollUnavailable = routeResult && routeResult.toll_cost_mxn == null;
  const tollValue = Number(tollCost || 0);
  const fuelValue = Number(routeResult?.fuel_cost_mxn || 0);
  const totalValue = Number(routeResult?.total_cost_mxn ?? tollValue + fuelValue);
  const tollDisplay = tollUnavailable
    ? 'No disponible'
    : routeResult && tollValue <= 0
      ? 'Sin casetas'
      : `$${tollValue.toFixed(2)} MXN`;

  return (
    <section className={drawerClass} aria-label="Desglose de costos">
      <div className={drawerHeadClass}>
        <button type="button" className={drawerCloseClass} onClick={onClose} aria-label="Cerrar desglose de costos"><X size={20} /></button>
        <div>
          <strong className="block">Desglose de costos</strong>
          <small className="text-slate-500">Peajes reales, combustible y total</small>
        </div>
      </div>

      <div className="grid gap-3">
        <div className={panelCardClass}>
          <span className={labelTextClass}>Costo real de casetas</span>
          <strong className="block">{tollDisplay}</strong>
        </div>
        <div className={panelCardClass}>
          <span className={labelTextClass}>Fuente de peajes</span>
          <strong className="block">{sourceLabel}</strong>
        </div>
        <div className={panelCardClass}>
          <span className={labelTextClass}>Preferencia de ruta</span>
          <strong className="block">{routeForm.avoid_tolls ? 'Evitando peajes' : 'Ruta con peajes permitidos'}</strong>
        </div>
        <div className={panelCardClass}>
          <span className={labelTextClass}>Punto de caseta / corredor</span>
          <strong className="block">
            {routeResult?.toll_corridors?.length
              ? routeResult.toll_corridors.join(', ')
              : tollUnavailable
                ? 'No disponible'
                : 'Sin tramos con caseta detectados'}
          </strong>
        </div>
        <div className={panelCardClass}>
          <span className={labelTextClass}>Combustible estimado</span>
          <strong className="block">${fuelValue.toFixed(2)} MXN</strong>
          {routeResult?.fuel_consumption_liters != null && (
            <small className="mt-1 block text-slate-500">
              {Number(routeResult.fuel_consumption_liters).toFixed(2)} L a ${Number(routeResult.fuel_price_per_liter || 0).toFixed(2)} MXN/L
            </small>
          )}
        </div>
        <div className={panelCardClass}>
          <span className={labelTextClass}>Total del viaje</span>
          <strong className="block">${totalValue.toFixed(2)} MXN</strong>
          <small className="mt-1 block text-slate-500">
            {tollUnavailable ? 'Combustible calculado; peaje real no disponible' : 'Peajes reales + combustible'}
          </small>
        </div>
        {routeResult?.toll_warning && (
          <div className={panelCardClass}>
            <span className={labelTextClass}>Aviso</span>
            <strong className="block">{routeResult.toll_warning}</strong>
          </div>
        )}
      </div>
    </section>
  );
}
