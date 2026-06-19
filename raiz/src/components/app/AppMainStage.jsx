import MapView from '../MapView.jsx';
import MapControls from '../layout/MapControls.jsx';
import RouteCard from '../route/RouteCard.jsx';
import SummarySheet from '../route/SummarySheet.jsx';
import { cx } from '../ui/classes.js';

export default function AppMainStage({
  currentTime,
  navigationActive,
  routeResult,
  redZones,
  origin,
  destination,
  stops,
  trafficLevel,
  mapLayer,
  vehiclePosition,
  vehicleHeading,
  configOpen,
  setMapInstance,
  routeCardProps,
  mapControlProps,
  summaryOpen,
  summaryProps
}) {
  return (
    <main className="relative h-full w-full overflow-hidden">
      <div className={cx(
        'pointer-events-none fixed left-1/2 top-3 z-20 flex min-h-12 w-[min(560px,calc(100vw-7rem))] -translate-x-1/2 items-center justify-between rounded-full border border-slate-200 bg-white/96 px-5 text-xs font-black uppercase tracking-[0.08em] text-slate-950 shadow-2xl shadow-slate-950/20 ring-1 ring-white backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white dark:ring-white/10',
        navigationActive && 'hidden'
      )}>
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.75)] dark:bg-yellow-300 dark:shadow-[0_0_18px_rgba(250,204,21,0.6)]" />
        <strong className="text-slate-950 dark:text-white">GPS NAVIGATOR</strong>
        <time className="rounded-full border border-slate-200 bg-slate-950 px-3 py-1 text-sm leading-none text-white shadow-sm dark:border-white/10 dark:bg-yellow-300 dark:text-slate-950" dateTime={new Date().toISOString()}>{currentTime}</time>
      </div>

      <MapView
        routePoly={routeResult?.polyline}
        origin={origin}
        destination={destination}
        stops={stops}
        redZones={redZones}
        trafficLevel={trafficLevel}
        mapLayer={mapLayer}
        navigationActive={navigationActive}
        vehiclePosition={vehiclePosition}
        vehicleHeading={vehicleHeading}
        layoutKey={`${configOpen ? 'config-open' : 'config-closed'}-${navigationActive ? 'nav' : 'plan'}`}
        onMapReady={setMapInstance}
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/10 via-transparent to-white/10 dark:from-slate-950/20 dark:to-slate-950/20" />

      {!navigationActive && <RouteCard {...routeCardProps} />}

      {!navigationActive && <MapControls {...mapControlProps} />}

      {summaryOpen && routeResult && <SummarySheet {...summaryProps} />}
    </main>
  );
}
