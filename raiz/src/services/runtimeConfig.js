const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const wsBaseUrl = (import.meta.env.VITE_WS_BASE_URL || '').replace(/\/$/, '');


export function apiUrl(path) {
  return `${apiBaseUrl}${path}`;
}


export function websocketUrl(endpoint) {
  if (wsBaseUrl) {
    return `${wsBaseUrl}${endpoint}`;
  }

  if (apiBaseUrl) {
    const url = new URL(apiBaseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = endpoint;
    url.search = '';
    url.hash = '';
    return url.toString();
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}${endpoint}`;
}
