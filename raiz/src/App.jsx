import { useCallback, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import AppView from './components/app/AppView.jsx';
import { initialRoute } from './data/routeData.js';
import { defaultVehicleConfig } from './data/defaultVehicleConfig.js';
import { saveSavedRoute } from './services/api.js';
import { useWebSocket } from './hooks/useWebSocket.js';
import { useDeviceClock } from './hooks/useDeviceClock.js';
import { useCompassHeading } from './hooks/useCompassHeading.js';
import { useDraggableOffset } from './hooks/useDraggableOffset.js';
import { useNavigationMode } from './hooks/useNavigationMode.js';
import { usePlaceRouting } from './hooks/usePlaceRouting.js';
import { useRouteAutoRefresh } from './hooks/useRouteAutoRefresh.js';
import { useRouteController } from './hooks/useRouteController.js';
import { useRouteDerivedState } from './hooks/useRouteDerivedState.js';
import { useSessionPersistence } from './hooks/useSessionPersistence.js';
import { useStartupData } from './hooks/useStartupData.js';
import { useStoredRoutes } from './hooks/useStoredRoutes.js';
import { useThemeMode } from './hooks/useThemeMode.js';
import { useWeatherPanel } from './hooks/useWeatherPanel.js';
import { hasDestination, hasRouteEndpoints } from './utils/routeGuards.js';
import { CURRENT_LOCATION_LABEL } from './utils/routeUtils.js';
import { loadSessionSettings } from './utils/sessionStorage.js';
import { notifyError, notifyInfo, notifySuccess, notifyWarning } from './utils/notify.js';
import { pointAtDistance } from './utils/navigationUtils.js';

const savedSession = loadSessionSettings();

function requestCurrentPosition() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Tu navegador no permite obtener ubicacion GPS real'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
}

export default function App() {
  const [theme, setTheme] = useState(savedSession.theme);
  const currentTime = useDeviceClock();
  const {
    compassActive,
    compassAvailable,
    compassHeading,
    toggleCompass
  } = useCompassHeading();
  const [mapLayer, setMapLayer] = useState(savedSession.mapLayer);
  const [routeForm, setRouteForm] = useState({ ...initialRoute, ...savedSession.routeForm });
  const [routeResult, setRouteResult] = useState(null);
  const [originName, setOriginName] = useState(savedSession.originName);
  const [destinationName, setDestinationName] = useState(savedSession.destinationName);
  const [configOpen, setConfigOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [routeOptionsOpen, setRouteOptionsOpen] = useState(false);
  const [tollDetailOpen, setTollDetailOpen] = useState(false);
  const {
    weatherOpen,
    setWeatherOpen,
    weatherData,
    weatherLoading,
    weatherError,
    loadCurrentWeather
  } = useWeatherPanel();
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [recentsOpen, setRecentsOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const {
    offset: summaryOffset,
    dragging: summaryDragging,
    startDrag: startSummaryDrag
  } = useDraggableOffset();
  const [activeNav, setActiveNav] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [redZones, setRedZones] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [locatingOrigin, setLocatingOrigin] = useState(false);
  const [vehicleConfig, setVehicleConfig] = useState({ ...defaultVehicleConfig, ...savedSession.vehicleConfig });

  useThemeMode(theme);
  useSessionPersistence({
    theme,
    mapLayer,
    routeForm,
    originName,
    destinationName,
    vehicleConfig
  });

  const { rememberRecentRoute, refreshRoute } = useRouteController({
    routeForm,
    setRouteResult,
    destinationName,
    originName,
    vehicleConfig
  });

  const {
    savedRoutes,
    recentRoutes,
    setRecentRoutes,
    openFavorites,
    openRecents,
    refreshSavedRoutes,
    refreshRecentRoutes,
    loadSavedRoute,
    loadRecentRoute
  } = useStoredRoutes({
    routeForm,
    setRouteForm,
    setOriginName,
    setDestinationName,
    setActiveNav,
    setFavoritesOpen,
    setRecentsOpen,
    refreshRoute,
    rememberRecentRoute
  });

  const handleNewAlert = useCallback((payload) => {
    setAlerts((prev) => [payload, ...prev].slice(0, 4));
    notifyWarning(payload.message || 'Nueva alerta en la ruta', payload.message || 'route-alert');
  }, []);

  useWebSocket('/ws', handleNewAlert);

  useStartupData({
    routeForm,
    setRouteForm,
    setOriginName,
    setLocatingOrigin,
    setAlerts,
    setRecentRoutes,
    setRedZones,
    refreshRoute,
    setActiveNav,
    setSummaryOpen
  });

  const {
    origin,
    destination,
    duration,
    distance,
    fuelLiters,
    tollCost,
    riskScore,
    redZoneCount,
    avoidedZoneCount,
    trafficLevel,
    trafficSource,
    isElectricVehicle,
    batteryUsed,
    estimatedBatteryLevel,
    frequentPlaces,
    routeSteps
  } = useRouteDerivedState({
    routeForm,
    routeResult,
    alerts,
    recentRoutes,
    vehicleConfig,
    destinationName
  });

  const {
    applyDestination,
    applyOrigin,
    applyStop,
    closeStopEditor,
    destinationEditing,
    destinationQuery,
    destinationSearching,
    destinationSuggestions,
    handleDestinationSearch,
    handleOriginSearch,
    handleSearch,
    handleStopSearch,
    openAddStop,
    openEditStop,
    originEditing,
    originQuery,
    originSearching,
    originSuggestions,
    query,
    searchOpen,
    searching,
    searchSuggestions,
    stopEditingId,
    stopQuery,
    stopSearching,
    stopSuggestions,
    setDestinationEditing,
    setDestinationQuery,
    setDestinationSuggestions,
    setOriginEditing,
    setOriginQuery,
    setOriginSuggestions,
    setQuery,
    setSearchOpen,
    setStopQuery,
    removeStop
  } = usePlaceRouting({
    routeForm,
    setRouteForm,
    setRouteResult,
    origin,
    setOriginName,
    setDestinationName,
    setActiveNav,
    setSummaryOpen,
    mapInstance,
    refreshRoute
  });

  const {
    navigationActive,
    setNavigationActive,
    navigationProgress,
    traveledMeters,
    progressPercent,
    navigationSpeed,
    navigationMode,
    navigationDetailsOpen,
    setNavigationDetailsOpen,
    routePoints,
    routeNavMetrics,
    vehiclePosition,
    vehicleHeading,
    remainingMeters,
    remainingMinutes,
    navigationArrival,
    currentManeuver,
    resetNavigationStart,
    stopNavigation
  } = useNavigationMode({ routeResult, duration });

  useRouteAutoRefresh({
    routeForm,
    routeResult,
    navigationActive,
    refreshRoute
  });

  const updateVehicleConfig = (key, value) => {
    const nextVehicleConfig = {
      ...vehicleConfig,
      [key]: value,
      ...(key === 'vehicle' && value === 'Electrico' ? { fuel: 'Electrico' } : {}),
      ...(key === 'vehicle' && value !== 'Electrico' && vehicleConfig.fuel === 'Electrico' ? { fuel: 'Gasolina' } : {})
    };

    setVehicleConfig(nextVehicleConfig);

    if (key === 'vehicle' && hasRouteEndpoints(routeForm)) {
      refreshRoute(routeForm, true, true, { vehicleConfigOverride: nextVehicleConfig })
        .catch(() => notifyError('No se pudo recalcular casetas para ese vehiculo', 'vehicle-toll-recalc-error'));
    }

    if (key === 'efficiency') {
      const kmPerLiter = Math.max(Number(value || 5.5) || 1, 1);
      const nextForm = { ...routeForm, vehicle_consumption: String(100 / kmPerLiter) };
      setRouteForm(nextForm);
      if (hasRouteEndpoints(nextForm)) {
        refreshRoute(nextForm, true, true, { vehicleConfigOverride: nextVehicleConfig }).catch(() => notifyError('No se pudo recalcular consumo', 'fuel-recalc-error'));
      }
    }
  };

  const updateRouteOption = async (key, value) => {
    const nextForm = { ...routeForm, [key]: value };
    setRouteForm(nextForm);

    if (!hasRouteEndpoints(nextForm)) {
      notifyInfo('Obtén tu ubicación real y selecciona un destino para calcular opciones de ruta', 'route-options-need-destination');
      return;
    }

    try {
      await refreshRoute(nextForm, true);
      notifySuccess('Opciones de ruta actualizadas', 'route-options-updated');
    } catch {
      notifyError('No se pudo recalcular con esas opciones', 'route-options-error');
    }
  };

  const refreshRouteFromCurrentLocation = async ({ silent = false, remember = false, zoom = 15 } = {}) => {
    if (!hasDestination(routeForm)) {
      throw new Error('Selecciona un destino antes de calcular la salida real');
    }

    setLocatingOrigin(true);
    try {
      const { coords } = await requestCurrentPosition();
      const nextForm = {
        ...routeForm,
        origin_lat: coords.latitude.toFixed(6),
        origin_lng: coords.longitude.toFixed(6)
      };

      setRouteForm(nextForm);
      setOriginName(CURRENT_LOCATION_LABEL);
      mapInstance?.flyTo([coords.latitude, coords.longitude], Math.max(mapInstance.getZoom(), zoom), {
        duration: 0.75
      });

      const data = await refreshRoute(nextForm, silent, remember);
      return { coords, data, nextForm };
    } finally {
      setLocatingOrigin(false);
    }
  };

  const leaveNow = async () => {
    try {
      await refreshRouteFromCurrentLocation({ silent: false, remember: false, zoom: 16 });
      setActiveNav('Navegar');
      setSearchOpen(false);
      setConfigOpen(false);
      setFavoritesOpen(false);
      setRecentsOpen(false);
      setStepsOpen(false);
      setRouteOptionsOpen(false);
      setTollDetailOpen(false);
      setWeatherOpen(false);
      setSummaryOpen(true);
    } catch (error) {
      notifyError(error.message || 'No se pudo recalcular desde tu ubicacion GPS real', 'leave-now-route-error');
    }
  };

  const swapRoute = async () => {
    if (!hasRouteEndpoints(routeForm)) {
      notifyInfo('Obtén tu ubicación real y selecciona un destino antes de invertir la ruta', 'swap-needs-destination');
      return;
    }

    const nextForm = {
      ...routeForm,
      origin_lat: routeForm.dest_lat,
      origin_lng: routeForm.dest_lng,
      dest_lat: routeForm.origin_lat,
      dest_lng: routeForm.origin_lng,
      stops: [...(Array.isArray(routeForm.stops) ? routeForm.stops : [])].reverse()
    };

    setRouteForm(nextForm);
    setOriginName(destinationName);
    setDestinationName(originName);

    try {
      await refreshRoute(nextForm, true);
      notifySuccess('Ruta invertida', 'route-swapped');
    } catch {
      notifyError('No se pudo invertir la ruta', 'route-swap-error');
    }
  };

  const locateOrigin = () => {
    if (!navigator.geolocation) {
      notifyError('Tu navegador no permite obtener la ubicacion', 'geolocation-unsupported');
      return;
    }

    setLocatingOrigin(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const nextForm = {
          ...routeForm,
          origin_lat: coords.latitude.toFixed(6),
          origin_lng: coords.longitude.toFixed(6)
        };

        setRouteForm(nextForm);
        setOriginName(CURRENT_LOCATION_LABEL);
        mapInstance?.flyTo([coords.latitude, coords.longitude], Math.max(mapInstance.getZoom(), 15), {
          duration: 0.75
        });

        try {
          if (hasRouteEndpoints(nextForm)) {
            await refreshRoute(nextForm, true);
          }
          notifySuccess('Punto de partida actualizado con tu ubicacion real', 'origin-updated');
        } catch {
          notifyError('Ubicacion obtenida, pero no se pudo recalcular la ruta', 'origin-route-error');
        } finally {
          setLocatingOrigin(false);
        }
      },
      () => {
        notifyError('No se pudo obtener tu ubicacion. Revisa el permiso del navegador', 'geolocation-error');
        setLocatingOrigin(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  const zoomMap = (direction) => {
    if (!mapInstance) return;
    if (direction === 'in') {
      mapInstance.zoomIn();
    } else {
      mapInstance.zoomOut();
    }
  };

  const handleToggleCompass = async () => {
    const wasActive = compassActive;
    const enabled = await toggleCompass();
    if (!enabled) {
      notifyInfo('La brujula no esta disponible o no tiene permiso en este dispositivo', 'compass-unavailable');
      return;
    }
    notifyInfo(wasActive ? 'Brujula desactivada' : 'Brujula activada', 'compass-toggle');
  };

  const recenterNavigation = () => {
    const point = vehiclePosition || pointAtDistance(routePoints, routeNavMetrics.cumulative, navigationProgress);
    if (!mapInstance || !point) return;
    mapInstance.flyTo(point, Math.max(mapInstance.getZoom(), 17), {
      duration: 0.45
    });
  };

  const closePanel = (setter) => {
    setter(false);
    setActiveNav('Navegar');
  };

  const startNavigation = async () => {
    try {
      if (navigationActive) {
        stopNavigation();
        notifyInfo('Navegacion detenida', 'navigation-stopped');
        return;
      }

      if (!hasDestination(routeForm)) {
        notifyInfo('Selecciona un destino para iniciar navegacion con GPS real', 'navigation-needs-destination');
        return;
      }

      const { coords } = await refreshRouteFromCurrentLocation({ silent: true, remember: false, zoom: 17 });
      resetNavigationStart();
      setSummaryOpen(false);
      setStepsOpen(false);
      setSearchOpen(false);
      setConfigOpen(false);
      setFavoritesOpen(false);
      setRecentsOpen(false);
      setNavigationActive(true);
      notifySuccess('Navegacion GPS iniciada', 'navigation-started');
      mapInstance?.flyTo([coords.latitude, coords.longitude], Math.max(mapInstance.getZoom(), 17), {
        duration: 0.75
      });
    } catch (error) {
      notifyError(error.message || 'No se pudo iniciar navegacion con GPS real', 'navigation-start-error');
    }
  };

  const saveRoute = async () => {
    if (!hasRouteEndpoints(routeForm) || !routeResult) {
      notifyInfo('Obtén tu ubicación real, selecciona destino y calcula una ruta antes de guardarla', 'save-needs-route');
      return;
    }

    const savedRoute = {
      name: destinationName,
      originName,
      origin,
      destination,
      form: routeForm,
      distance,
      duration,
      tollCost,
      vehicle: vehicleConfig.vehicle,
      batteryLevel: isElectricVehicle ? estimatedBatteryLevel : null
    };

    try {
      await saveSavedRoute(savedRoute);
      await refreshSavedRoutes();
      notifySuccess('Ruta guardada en favoritos', 'route-saved');
    } catch {
      notifyError('No se pudo guardar la ruta', 'route-save-error');
    }
  };

  const handleNavSelect = (label) => {
    setActiveNav(label);
    setSearchOpen(false);
    setConfigOpen(false);
    setFavoritesOpen(false);
    setRecentsOpen(false);
    setStepsOpen(false);
    setRouteOptionsOpen(false);
    setTollDetailOpen(false);
    setWeatherOpen(false);
    setSummaryOpen(label === 'Navegar');
    if (label === 'Buscar') {
      setSearchOpen(true);
      refreshRecentRoutes().catch(() => setRecentRoutes([]));
    }
    if (label === 'Ajustes') setConfigOpen(true);
    if (label === 'Paradas') {
      setActiveNav('Paradas');
      openAddStop();
      setSummaryOpen(false);
    }
    if (label === 'Favoritos') openFavorites();
    if (label === 'Recientes') openRecents();
    if (label === 'Clima') loadCurrentWeather();
  };

  return (
    <AppView
      activeNav={activeNav}
      alerts={alerts}
      applyDestination={applyDestination}
      applyOrigin={applyOrigin}
      applyStop={applyStop}
      avoidedZoneCount={avoidedZoneCount}
      batteryUsed={batteryUsed}
      closePanel={closePanel}
      closeStopEditor={closeStopEditor}
      compassActive={compassActive}
      compassAvailable={compassAvailable}
      compassHeading={compassHeading}
      configOpen={configOpen}
      currentManeuver={currentManeuver}
      currentTime={currentTime}
      destination={destination}
      destinationEditing={destinationEditing}
      destinationName={destinationName}
      destinationQuery={destinationQuery}
      destinationSearching={destinationSearching}
      destinationSuggestions={destinationSuggestions}
      distance={distance}
      duration={duration}
      estimatedBatteryLevel={estimatedBatteryLevel}
      favoritesOpen={favoritesOpen}
      frequentPlaces={frequentPlaces}
      fuelLiters={fuelLiters}
      handleDestinationSearch={handleDestinationSearch}
      handleNavSelect={handleNavSelect}
      handleOriginSearch={handleOriginSearch}
      handleSearch={handleSearch}
      handleStopSearch={handleStopSearch}
      handleToggleCompass={handleToggleCompass}
      isElectricVehicle={isElectricVehicle}
      loadCurrentWeather={loadCurrentWeather}
      loadRecentRoute={loadRecentRoute}
      loadSavedRoute={loadSavedRoute}
      locateOrigin={locateOrigin}
      leaveNow={leaveNow}
      locatingOrigin={locatingOrigin}
      mapLayer={mapLayer}
      navigationActive={navigationActive}
      navigationArrival={navigationArrival}
      navigationDetailsOpen={navigationDetailsOpen}
      navigationMode={navigationMode}
      navigationSpeed={navigationSpeed}
      openEditStop={openEditStop}
      origin={origin}
      originEditing={originEditing}
      originName={originName}
      originQuery={originQuery}
      originSearching={originSearching}
      originSuggestions={originSuggestions}
      progressPercent={progressPercent}
      query={query}
      recentRoutes={recentRoutes}
      recentsOpen={recentsOpen}
      recenterNavigation={recenterNavigation}
      redZoneCount={redZoneCount}
      redZones={redZones}
      refreshRecentRoutes={refreshRecentRoutes}
      refreshRoute={refreshRoute}
      remainingMeters={remainingMeters}
      remainingMinutes={remainingMinutes}
      riskScore={riskScore}
      routeForm={routeForm}
      routeOptionsOpen={routeOptionsOpen}
      routeResult={routeResult}
      routeSteps={routeSteps}
      savedRoutes={savedRoutes}
      saveRoute={saveRoute}
      searchOpen={searchOpen}
      searching={searching}
      searchSuggestions={searchSuggestions}
      setActiveNav={setActiveNav}
      setCompassMapLayer={setMapLayer}
      setConfigOpen={setConfigOpen}
      setDestinationEditing={setDestinationEditing}
      setDestinationQuery={setDestinationQuery}
      setDestinationSuggestions={setDestinationSuggestions}
      setFavoritesOpen={setFavoritesOpen}
      setMapInstance={setMapInstance}
      setNavigationDetailsOpen={setNavigationDetailsOpen}
      setOriginEditing={setOriginEditing}
      setOriginQuery={setOriginQuery}
      setOriginSuggestions={setOriginSuggestions}
      setQuery={setQuery}
      setRecentRoutes={setRecentRoutes}
      setRecentsOpen={setRecentsOpen}
      setRouteOptionsOpen={setRouteOptionsOpen}
      setSearchOpen={setSearchOpen}
      setStepsOpen={setStepsOpen}
      setStopQuery={setStopQuery}
      setSummaryOpen={setSummaryOpen}
      setTheme={setTheme}
      setTollDetailOpen={setTollDetailOpen}
      setWeatherOpen={setWeatherOpen}
      startNavigation={startNavigation}
      startSummaryDrag={startSummaryDrag}
      stepsOpen={stepsOpen}
      stopNavigation={stopNavigation}
      stopEditingId={stopEditingId}
      stopQuery={stopQuery}
      stopSearching={stopSearching}
      stopSuggestions={stopSuggestions}
      removeStop={removeStop}
      summaryDragging={summaryDragging}
      summaryOffset={summaryOffset}
      summaryOpen={summaryOpen}
      swapRoute={swapRoute}
      theme={theme}
      tollCost={tollCost}
      tollDetailOpen={tollDetailOpen}
      trafficLevel={trafficLevel}
      trafficSource={trafficSource}
      traveledMeters={traveledMeters}
      updateRouteOption={updateRouteOption}
      updateVehicleConfig={updateVehicleConfig}
      vehicleConfig={vehicleConfig}
      vehicleHeading={vehicleHeading}
      vehiclePosition={vehiclePosition}
      weatherData={weatherData}
      weatherError={weatherError}
      weatherLoading={weatherLoading}
      weatherOpen={weatherOpen}
      zoomMap={zoomMap}
    />
  );
}
