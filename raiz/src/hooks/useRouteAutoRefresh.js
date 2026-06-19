import { useEffect } from 'react';
import { hasRouteEndpoints } from '../utils/routeGuards.js';

export function useRouteAutoRefresh({
  routeForm,
  routeResult,
  navigationActive,
  refreshRoute
}) {
  useEffect(() => {
    if (!hasRouteEndpoints(routeForm) || routeResult) return;
    refreshRoute(routeForm, true, false).catch(() => {});
  }, [refreshRoute, routeForm, routeResult]);

  useEffect(() => {
    if (!hasRouteEndpoints(routeForm)) return undefined;

    const intervalMs = navigationActive ? 30000 : 90000;
    const timer = window.setInterval(() => {
      refreshRoute(routeForm, true, false, { clearBeforeFetch: false }).catch(() => {});
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [navigationActive, refreshRoute, routeForm]);
}
