import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, MapPin, Plus, Save, ShieldAlert, Trash2, X } from 'lucide-react';
import {
  cx,
  drawerClass,
  drawerCloseClass,
  drawerHeadClass,
  inputClass,
  labelTextClass,
  panelCardClass,
  softButtonClass
} from '../ui/classes.js';

const emptyForm = {
  id: null,
  name: '',
  lat: '',
  lng: '',
  risk_level: 'alto'
};

export default function RedZonesDrawer({
  zones,
  mapInstance,
  saving,
  onClose,
  onSave,
  onDelete
}) {
  const [form, setForm] = useState(emptyForm);
  const editableZones = useMemo(() => zones.filter((zone) => zone.editable), [zones]);

  useEffect(() => {
    if (form.id && !editableZones.some((zone) => zone.id === form.id)) {
      setForm(emptyForm);
    }
  }, [editableZones, form.id]);

  const editZone = (zone) => {
    setForm({
      id: zone.id,
      name: zone.name,
      lat: String(zone.center?.lat ?? ''),
      lng: String(zone.center?.lng ?? ''),
      risk_level: zone.risk_level || 'alto'
    });
  };

  const useMapCenter = () => {
    const center = mapInstance?.getCenter();
    if (!center) return;
    setForm((current) => ({
      ...current,
      lat: center.lat.toFixed(6),
      lng: center.lng.toFixed(6)
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const saved = await onSave({
      id: form.id,
      name: form.name.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      risk_level: form.risk_level
    });
    if (saved) setForm(emptyForm);
  };

  return (
    <section
      className={cx(
        drawerClass,
        'right-20 w-[min(420px,calc(100vw-6rem))] max-sm:right-4 max-sm:w-[calc(100vw-2rem)]'
      )}
      aria-label="Administrar zonas rojas"
    >
      <div className={cx(drawerHeadClass, 'items-start')}>
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-500/10 text-red-500">
            <ShieldAlert size={21} />
          </span>
          <div className="min-w-0 pt-0.5">
            <strong className="block text-lg leading-tight">Zonas rojas</strong>
            <small className="mt-1 block leading-relaxed text-slate-500">
              A* mantiene 5 km de distancia alrededor de cada zona.
            </small>
          </div>
        </div>
        <button
          type="button"
          className={cx(drawerCloseClass, 'ml-auto shrink-0')}
          onClick={onClose}
          aria-label="Cerrar zonas rojas"
        >
          <X size={20} />
        </button>
      </div>

      <form className="grid gap-4" onSubmit={submit}>
        <div className={cx(panelCardClass, 'grid gap-4 overflow-hidden')}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <strong className="block">{form.id ? 'Editar zona' : 'Nueva zona'}</strong>
              <small className="mt-0.5 block text-slate-500">Define el punto y su nivel de riesgo.</small>
            </div>
            {form.id && (
              <button type="button" className="shrink-0 text-xs font-black text-emerald-600" onClick={() => setForm(emptyForm)}>
                <Plus className="inline" size={15} /> Nueva
              </button>
            )}
          </div>

          <label className="grid gap-2">
            <span className={labelTextClass}>Nombre</span>
            <input
              required
              minLength={2}
              className={inputClass}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ej. Cruce con incidentes"
            />
          </label>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2">
              <span className={labelTextClass}>Latitud</span>
              <input
                required
                type="number"
                step="any"
                min="-90"
                max="90"
                className={inputClass}
                value={form.lat}
                onChange={(event) => setForm((current) => ({ ...current, lat: event.target.value }))}
              />
            </label>
            <label className="grid min-w-0 gap-2">
              <span className={labelTextClass}>Longitud</span>
              <input
                required
                type="number"
                step="any"
                min="-180"
                max="180"
                className={inputClass}
                value={form.lng}
                onChange={(event) => setForm((current) => ({ ...current, lng: event.target.value }))}
              />
            </label>
          </div>

          <button type="button" className={softButtonClass} onClick={useMapCenter}>
            <MapPin size={18} /> Usar centro del mapa
          </button>

          <label className="grid gap-2">
            <span className={labelTextClass}>Nivel de riesgo</span>
            <select
              className={inputClass}
              value={form.risk_level}
              onChange={(event) => setForm((current) => ({ ...current, risk_level: event.target.value }))}
            >
              <option value="medio">Medio</option>
              <option value="medio-alto">Medio-alto</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 font-black text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            <Save size={18} /> {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Añadir zona roja'}
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-500" />
            <strong>Zonas creadas</strong>
          </div>
          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-black text-red-500">
            {editableZones.length}
          </span>
        </div>

        {editableZones.length ? editableZones.map((zone) => (
          <div key={zone.id} className={cx(panelCardClass, 'flex items-center justify-between gap-3')}>
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => editZone(zone)}>
              <strong className="block truncate">{zone.name}</strong>
              <small className="text-slate-500">
                {Number(zone.center?.lat).toFixed(5)}, {Number(zone.center?.lng).toFixed(5)} · {zone.risk_level}
              </small>
            </button>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
              onClick={() => onDelete(zone)}
              aria-label={`Eliminar ${zone.name}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        )) : (
          <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-slate-100/70 px-5 py-7 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <span className="grid size-10 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800">
              <AlertTriangle size={19} />
            </span>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Aún no hay zonas personalizadas</p>
            <small className="text-slate-500">Completa el formulario para añadir la primera.</small>
          </div>
        )}
      </div>
    </section>
  );
}
