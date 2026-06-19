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
        'pointer-events-none fixed left-1/2 top-3 z-20 flex min-h-11 w-[min(560px,calc(100vw-7rem))] -translate-x-1/2 items-center justify-between rounded-full border border-white/25 bg-red-600/78 px-5 text-xs font-black uppercase tracking-[0.08em] text-white shadow-2xl shadow-red-950/25 ring-1 ring-red-200/25 backdrop-blur-2xl',
        navigationActive && 'hidden'
      )}>
        <span className="h-2.5 w-2.5 rounded-full bg-white/85 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
        <strong className="text-blue-950 drop-shadow-[0_1px_8px_rgba(30,64,175,0.55)] dark:text-violet-950 dark:drop-shadow-[0_1px_8px_rgba(91,33,182,0.75)]">GPS NAVIGATOR</strong>
        <time className="rounded-full border border-white/20 bg-white/16 px-3 py-1 text-sm leading-none shadow-inner shadow-white/10" dateTime={new Date().toISOString()}>{currentTime}</time>
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
