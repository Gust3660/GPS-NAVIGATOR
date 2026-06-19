import { ToastContainer } from 'react-toastify';
import AppMainStage from './AppMainStage.jsx';
import AppOverlays from './AppOverlays.jsx';
import SideRail from '../layout/SideRail.jsx';
import { navItems, vehicleTypes } from '../../data/routeData.js';
import { hasDestination, hasOrigin } from '../../utils/routeGuards.js';
import { notifyInfo } from '../../utils/notify.js';

export default function AppView({
  activeNav,
  alerts,
  applyDestination,
  applyOrigin,
  applyStop,
  avoidedZoneCount,
  batteryUsed,
  closePanel,
  closeStopEditor,
  compassActive,
  compassAvailable,
  compassHeading,
  configOpen,
  currentManeuver,
  currentTime,
  destination,
  destinationEditing,
  destinationName,
  destinationQuery,
  destinationSearching,
  destinationSuggestions,
  distance,
  duration,
  estimatedBatteryLevel,
  favoritesOpen,
  frequentPlaces,
  fuelLiters,
  handleDestinationSearch,
  handleNavSelect,
  handleOriginSearch,
  handleSearch,
  handleStopSearch,
  handleToggleCompass,
  isElectricVehicle,
  loadCurrentWeather,
  loadRecentRoute,
  loadSavedRoute,
  leaveNow,
  locatingOrigin,
  mapLayer,
  mapInstance,
  navigationActive,
  navigationArrival,
  navigationDetailsOpen,
  navigationMode,
  navigationSpeed,
  openEditStop,
  origin,
  originEditing,
  originName,
  originQuery,
  originSearching,
  originSuggestions,
  progressPercent,
  query,
  recentRoutes,
  recentsOpen,
  recenterNavigation,
  redZoneCount,
  redZones,
  redZonesOpen,
  redZoneSaving,
  saveRedZone,
  removeRedZone,
  refreshRecentRoutes,
  refreshRoute,
  remainingMeters,
  remainingMinutes,
  riskScore,
  routeForm,
  routeOptionsOpen,
  routeResult,
  routeSteps,
  savedRoutes,
  saveRoute,
  searchOpen,
  searching,
  searchSuggestions,
  stopEditingId,
  stopQuery,
  stopSearching,
  stopSuggestions,
  setActiveNav,
  setCompassMapLayer,
  setConfigOpen,
  setDestinationEditing,
  setDestinationQuery,
  setDestinationSuggestions,
  setFavoritesOpen,
  setMapInstance,
  setOriginEditing,
  setOriginQuery,
  setOriginSuggestions,
  setRecentsOpen,
  setRouteOptionsOpen,
  setRedZonesOpen,
  setSearchOpen,
  setStepsOpen,
  setSummaryOpen,
  setTheme,
  setTollDetailOpen,
  setWeatherOpen,
  setNavigationDetailsOpen,
  setQuery,
  setRecentRoutes,
  setStopQuery,
  removeStop,
  startNavigation,
  startSummaryDrag,
  stepsOpen,
  stopNavigation,
  summaryDragging,
  summaryOffset,
  summaryOpen,
  swapRoute,
  theme,
  tollCost,
  tollDetailOpen,
  trafficLevel,
  trafficSource,
  traveledMeters,
  updateRouteOption,
  updateVehicleConfig,
  vehicleConfig,
  vehicleHeading,
  vehiclePosition,
  weatherData,
  weatherError,
  weatherLoading,
  weatherOpen,
  zoomMap,
  locateOrigin
}) {
  const toggleMapLayer = () => setCompassMapLayer((current) => (current === 'standard' ? 'satellite' : 'standard'));

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-100 font-sans text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <ToastContainer
        position="top-right"
        theme={theme === 'light' ? 'light' : 'dark'}
        autoClose={2600}
        newestOnTop
        closeOnClick
      />

      {!navigationActive && <SideRail navItems={navItems} activeNav={activeNav} onSelect={handleNavSelect} />}

      <AppMainStage
        currentTime={currentTime}
        navigationActive={navigationActive}
        routeResult={routeResult}
        redZones={redZones}
        origin={origin}
        destination={destination}
        stops={Array.isArray(routeForm.stops) ? routeForm.stops : []}
        trafficLevel={trafficLevel}
        mapLayer={mapLayer}
        vehiclePosition={vehiclePosition}
        vehicleHeading={vehicleHeading}
        configOpen={configOpen}
        setMapInstance={setMapInstance}
        routeCardProps={{
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
          onOriginQueryChange: setOriginQuery,
          onDestinationQueryChange: setDestinationQuery,
          onStopQueryChange: setStopQuery,
          onOriginSubmit: handleOriginSearch,
          onDestinationSubmit: handleDestinationSearch,
          onStopSubmit: handleStopSearch,
          onSelectOrigin: applyOrigin,
          onSelectDestination: applyDestination,
          onSelectStop: applyStop,
          onCancelOrigin: () => {
            setOriginEditing(false);
            setOriginQuery('');
            setOriginSuggestions([]);
          },
          onCancelDestination: () => {
            setDestinationEditing(false);
            setDestinationQuery('');
            setDestinationSuggestions([]);
          },
          onCancelStop: closeStopEditor,
          onOpenOrigin: () => {
            setOriginQuery(hasOrigin(routeForm) ? `${routeForm.origin_lat}, ${routeForm.origin_lng}` : '');
            setDestinationEditing(false);
            setDestinationQuery('');
            setDestinationSuggestions([]);
            setOriginEditing(true);
          },
          onOpenDestination: () => {
            setDestinationQuery(
              hasDestination(routeForm)
                ? destinationName || `${routeForm.dest_lat}, ${routeForm.dest_lng}`
                : ''
            );
            setOriginEditing(false);
            setOriginQuery('');
            setOriginSuggestions([]);
            setDestinationSuggestions([]);
            setDestinationEditing(true);
          },
          onSwapRoute: swapRoute,
          onEditStop: openEditStop,
          onRemoveStop: removeStop,
          onOpenRouteOptions: () => setRouteOptionsOpen(true),
          onLeaveNow: leaveNow
        }}
        mapControlProps={{
          mapLayer,
          locatingOrigin,
          compassActive,
          compassAvailable,
          compassHeading,
          redZonesOpen,
          onToggleLayer: toggleMapLayer,
          onLocateOrigin: locateOrigin,
          onToggleCompass: handleToggleCompass,
          onZoom: zoomMap,
          onOpenRedZones: () => setRedZonesOpen((open) => !open)
        }}
        summaryOpen={summaryOpen}
        summaryProps={{
          dragging: summaryDragging,
          offset: summaryOffset,
          onStartDrag: startSummaryDrag,
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
          alertsCount: alerts.length,
          avoidedZoneCount,
          navigationActive,
          onStartNavigation: startNavigation,
          onOpenSteps: () => setStepsOpen(true),
          onSaveRoute: saveRoute,
          onOpenTollDetail: () => setTollDetailOpen(true)
        }}
      />

      <AppOverlays
        navigationActive={navigationActive}
        navigationHudProps={{
          maneuver: currentManeuver,
          arrivalTime: navigationArrival,
          remainingMinutes,
          remainingKm: remainingMeters / 1000,
          traveledKm: traveledMeters / 1000,
          progressPercent,
          speedKmh: navigationSpeed,
          navigationMode,
          detailsOpen: navigationDetailsOpen,
          totalDistanceKm: distance,
          tollCost,
          riskScore,
          mapLayer,
          compassActive,
          compassAvailable,
          compassHeading,
          onToggleLayer: toggleMapLayer,
          onToggleCompass: handleToggleCompass,
          onRecenter: recenterNavigation,
          onZoom: zoomMap,
          onToggleDetails: () => setNavigationDetailsOpen((current) => !current),
          onStop: () => {
            stopNavigation();
            notifyInfo('Navegacion detenida', 'navigation-stopped');
          }
        }}
        stepsOpen={stepsOpen}
        stepsProps={{
          routeSteps,
          distance,
          duration,
          riskScore,
          onClose: () => setStepsOpen(false)
        }}
        searchOpen={searchOpen}
        searchProps={{
          query,
          searching,
          suggestions: searchSuggestions,
          frequentPlaces,
          onQueryChange: setQuery,
          onSubmit: handleSearch,
          onClose: () => closePanel(setSearchOpen),
          onSelectDestination: applyDestination
        }}
        favoritesOpen={favoritesOpen}
        favoritesProps={{
          routes: savedRoutes,
          onClose: () => closePanel(setFavoritesOpen),
          onLoad: loadSavedRoute
        }}
        recentsOpen={recentsOpen}
        recentsProps={{
          routes: recentRoutes,
          onClose: () => closePanel(setRecentsOpen),
          onLoad: loadRecentRoute
        }}
        routeOptionsOpen={routeOptionsOpen}
        routeOptionsProps={{
          routeForm,
          tollCost,
          routeResult,
          isElectricVehicle,
          onClose: () => setRouteOptionsOpen(false),
          onUpdateRouteOption: updateRouteOption
        }}
        redZonesOpen={redZonesOpen}
        redZonesProps={{
          zones: redZones,
          mapInstance,
          saving: redZoneSaving,
          onClose: () => setRedZonesOpen(false),
          onSave: saveRedZone,
          onDelete: removeRedZone
        }}
        tollDetailOpen={tollDetailOpen}
        tollDetailProps={{
          tollCost,
          routeResult,
          routeForm,
          onClose: () => setTollDetailOpen(false)
        }}
        weatherOpen={weatherOpen}
        weatherProps={{
          weather: weatherData,
          loading: weatherLoading,
          error: weatherError,
          onRefresh: loadCurrentWeather,
          onClose: () => setWeatherOpen(false)
        }}
        configOpen={configOpen}
        configProps={{
          theme,
          onThemeChange: setTheme,
          isElectricVehicle,
          vehicleTypes,
          vehicleConfig,
          batteryUsed,
          estimatedBatteryLevel,
          onVehicleConfigChange: updateVehicleConfig,
          onClose: () => closePanel(setConfigOpen)
        }}
      />
    </div>
  );
}
