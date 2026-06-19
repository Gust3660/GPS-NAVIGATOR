import { History, Star } from 'lucide-react';
import NavigationHud from '../navigation/NavigationHud.jsx';
import ConfigDrawer from '../panels/ConfigDrawer.jsx';
import RouteListDrawer from '../panels/RouteListDrawer.jsx';
import RouteOptionsDrawer from '../panels/RouteOptionsDrawer.jsx';
import RedZonesDrawer from '../panels/RedZonesDrawer.jsx';
import SearchPanel from '../panels/SearchPanel.jsx';
import StepsDrawer from '../panels/StepsDrawer.jsx';
import TollDetailDrawer from '../panels/TollDetailDrawer.jsx';
import WeatherDrawer from '../panels/WeatherDrawer.jsx';

export default function AppOverlays({
  navigationActive,
  navigationHudProps,
  stepsOpen,
  stepsProps,
  searchOpen,
  searchProps,
  favoritesOpen,
  favoritesProps,
  recentsOpen,
  recentsProps,
  routeOptionsOpen,
  routeOptionsProps,
  redZonesOpen,
  redZonesProps,
  tollDetailOpen,
  tollDetailProps,
  weatherOpen,
  weatherProps,
  configOpen,
  configProps
}) {
  return (
    <>
      {navigationActive && <NavigationHud {...navigationHudProps} />}

      {stepsOpen && <StepsDrawer {...stepsProps} />}

      {searchOpen && <SearchPanel {...searchProps} />}

      {favoritesOpen && (
        <RouteListDrawer
          title="Rutas guardadas"
          ariaLabel="Rutas guardadas"
          ItemIcon={Star}
          EmptyIcon={Star}
          emptyTitle="No hay rutas guardadas"
          emptyText="Usa el boton Guardar en el resumen para agregar rutas a favoritos."
          {...favoritesProps}
        />
      )}

      {recentsOpen && (
        <RouteListDrawer
          title="Rutas recientes"
          ariaLabel="Rutas recientes"
          ItemIcon={History}
          EmptyIcon={History}
          emptyTitle="No hay rutas recientes"
          emptyText="Las rutas que calcules o cargues apareceran aqui automaticamente."
          {...recentsProps}
        />
      )}

      {routeOptionsOpen && <RouteOptionsDrawer {...routeOptionsProps} />}

      {redZonesOpen && <RedZonesDrawer {...redZonesProps} />}

      {tollDetailOpen && <TollDetailDrawer {...tollDetailProps} />}

      {weatherOpen && <WeatherDrawer {...weatherProps} />}

      {configOpen && <ConfigDrawer {...configProps} />}
    </>
  );
}
