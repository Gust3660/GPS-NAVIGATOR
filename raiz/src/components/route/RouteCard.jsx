import { ArrowDownUp, Clock3, Route, Trash2 } from 'lucide-react';
import { formatCoord, normalizeOriginName } from '../../utils/routeUtils.js';

function LocationEditor({
  query,
  onQueryChange,
  placeholder,
  suggestions,
  searching,
  onSubmit,
  onSelect,
  onCancel
}) {
  return (
    <form className="mt-2 grid gap-2" onSubmit={onSubmit}>
      <input
        className="min-h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-yellow-400 dark:focus:ring-yellow-400/15"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        autoFocus
      />
      {suggestions.length > 0 && (
        <div className="grid max-h-40 gap-1 overflow-auto rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          {suggestions.slice(0, 5).map((place) => (
            <button
              type="button"
              key={`${place.display_name}-${place.lat}-${place.lng}`}
              className="rounded-xl px-3 py-2 text-left text-xs transition hover:bg-emerald-50 dark:hover:bg-slate-800"
              onClick={() => onSelect(place)}
            >
              <strong className="block text-slate-950 dark:text-white">{place.name || place.display_name}</strong>
              <span className="line-clamp-2 text-slate-500">{place.display_name}</span>
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="submit"
          disabled={searching}
          className="min-h-10 rounded-2xl bg-emerald-500 px-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:bg-slate-400 dark:bg-yellow-400 dark:text-slate-950 dark:hover:bg-yellow-300"
        >
          {searching ? 'Buscando...' : 'Aplicar'}
        </button>
        <button
          type="button"
          className="min-h-10 rounded-2xl bg-slate-100 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function LocationRow({
  label,
  name,
  coord,
  editing,
  editor,
  onOpen
}) {
  return (
    <div>
      <small className="block text-xs font-semibold text-slate-500">{label}</small>
      {editing ? (
        editor
      ) : (
        <button
          type="button"
          className="block w-full rounded-2xl py-1 text-left transition hover:bg-slate-100 dark:hover:bg-slate-900"
          onClick={onOpen}
        >
          <strong className="block text-sm text-slate-950 dark:text-white">{name}</strong>
          {coord && <p className="mt-0.5 text-xs text-slate-500">{coord}</p>}
        </button>
      )}
    </div>
  );
}

function RouteMarkerRail({ rows }) {
  return (
    <div className="flex h-full min-h-32 flex-col items-center py-1" style={{ gridRow: `span ${rows} / span ${rows}` }}>
      <span className="grid size-7 place-items-center rounded-full bg-emerald-500/15">
        <span className="size-3.5 rounded-full border-[5px] border-emerald-500 bg-white dark:bg-slate-950" />
      </span>
      <span className="my-1.5 min-h-12 flex-1 border-l-2 border-dashed border-slate-300 dark:border-slate-600" />
      <span className="grid h-9 w-8 place-items-center text-red-500 drop-shadow-sm">
        <svg viewBox="0 0 32 40" className="h-9 w-8" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16 0C7.7 0 1 6.6 1 14.8c0 10.8 15 25.2 15 25.2s15-14.4 15-25.2C31 6.6 24.3 0 16 0Z"
          />
          <circle cx="16" cy="14.8" r="6.2" className="fill-white" />
        </svg>
      </span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/70 bg-white/45 px-4 text-left text-sm font-semibold text-slate-700 shadow-lg shadow-slate-900/10 ring-1 ring-white/65 backdrop-blur-2xl transition hover:bg-white/65 active:bg-emerald-400/55 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100 dark:ring-white/15 dark:hover:bg-slate-900/70 dark:active:bg-yellow-300/80 dark:active:text-slate-950"
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <Icon size={18} />
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

export default function RouteCard({
  routeForm,
  originName,
  destinationName,
  originEditing,
  destinationEditing,
  originQuery,
  destinationQuery,
  stopEditingId,
  stopQuery,
  originSuggestions,
  destinationSuggestions,
  stopSuggestions,
  originSearching,
  destinationSearching,
  stopSearching,
  onOriginQueryChange,
  onDestinationQueryChange,
  onStopQueryChange,
  onOriginSubmit,
  onDestinationSubmit,
  onStopSubmit,
  onSelectOrigin,
  onSelectDestination,
  onSelectStop,
  onCancelOrigin,
  onCancelDestination,
  onCancelStop,
  onOpenOrigin,
  onOpenDestination,
  onEditStop,
  onRemoveStop,
  onSwapRoute,
  onOpenRouteOptions,
  onLeaveNow
}) {
  const stops = Array.isArray(routeForm.stops) ? routeForm.stops : [];
  const destinationLat = String(routeForm.dest_lat ?? '').trim();
  const destinationLng = String(routeForm.dest_lng ?? '').trim();
  const hasDestination = destinationLat !== '' && destinationLng !== '' && Number.isFinite(Number(destinationLat)) && Number.isFinite(Number(destinationLng));
  const rowCount = 2 + stops.length + (stopEditingId === 'new' ? 1 : 0);
  const stopEditor = (
    <LocationEditor
      query={stopQuery}
      onQueryChange={onStopQueryChange}
      placeholder="Parada: direccion, lugar o coordenadas"
      suggestions={stopSuggestions}
      searching={stopSearching}
      onSubmit={onStopSubmit}
      onSelect={onSelectStop}
      onCancel={onCancelStop}
    />
  );

  return (
    <div className="fixed left-[96px] top-16 z-20 max-h-[calc(100vh-6rem)] w-[min(360px,calc(100vw-120px))] overflow-visible">
      <section className="grid max-h-[calc(100vh-6rem)] gap-3 overflow-y-auto overflow-x-hidden rounded-[28px] border border-slate-200/90 bg-white/95 p-4 shadow-uber backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/95">
      <div className="grid grid-cols-[32px_1fr] gap-x-3 gap-y-4">
        <RouteMarkerRail rows={rowCount} />
        <LocationRow
          label="Punto de partida"
          name={normalizeOriginName(originName)}
          coord={formatCoord(routeForm.origin_lat, routeForm.origin_lng)}
          editing={originEditing}
          onOpen={onOpenOrigin}
          editor={(
            <LocationEditor
              query={originQuery}
              onQueryChange={onOriginQueryChange}
              placeholder="Origen: direccion, lugar o 19.43, -99.13"
              suggestions={originSuggestions}
              searching={originSearching}
              onSubmit={onOriginSubmit}
              onSelect={onSelectOrigin}
              onCancel={onCancelOrigin}
            />
          )}
        />

        {stops.map((stop, index) => (
          <div key={stop.id || `${stop.lat}-${stop.lng}-${index}`} className="min-w-0">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <LocationRow
                  label={`Parada ${index + 1}`}
                  name={stop.name || 'Parada'}
                  coord={formatCoord(stop.lat, stop.lng)}
                  editing={stopEditingId === stop.id}
                  onOpen={() => onEditStop(stop)}
                  editor={stopEditingId === stop.id ? stopEditor : null}
                />
              </div>
              {stopEditingId !== stop.id && (
                <button
                  type="button"
                  className="mt-4 grid size-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                  onClick={() => onRemoveStop(stop.id)}
                  aria-label={`Quitar parada ${index + 1}`}
                  title="Quitar parada"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          </div>
        ))}

        {stopEditingId === 'new' && (
          <div>
            <small className="block text-xs font-semibold text-slate-500">Nueva parada</small>
            {stopEditor}
          </div>
        )}

        <LocationRow
          label="Destino"
          name={destinationName}
          coord={hasDestination ? formatCoord(routeForm.dest_lat, routeForm.dest_lng) : ''}
          editing={destinationEditing}
          onOpen={onOpenDestination}
          editor={(
            <LocationEditor
              query={destinationQuery}
              onQueryChange={onDestinationQueryChange}
              placeholder="Destino: direccion, lugar o coordenadas"
              suggestions={destinationSuggestions}
              searching={destinationSearching}
              onSubmit={onDestinationSubmit}
              onSelect={onSelectDestination}
              onCancel={onCancelDestination}
            />
          )}
        />
      </div>

      <div className="grid gap-2">
        <ActionButton icon={Route} label="Opciones de ruta" onClick={onOpenRouteOptions} />
        <ActionButton icon={Clock3} label="Salir ahora" onClick={onLeaveNow} />
      </div>
      </section>

      <button
        type="button"
        className="absolute -right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-2xl border border-white/70 bg-white/55 text-slate-950 shadow-xl shadow-slate-900/15 ring-1 ring-white/65 backdrop-blur-2xl transition hover:bg-white/75 active:bg-emerald-400/55 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-50 dark:ring-white/15 dark:hover:bg-slate-900/80 dark:active:bg-yellow-300/80 dark:active:text-slate-950"
        aria-label="Invertir ruta"
        title="Invertir ruta"
        onClick={onSwapRoute}
      >
        <ArrowDownUp size={18} />
      </button>
    </div>
  );
}
