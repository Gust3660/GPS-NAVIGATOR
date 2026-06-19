# Despliegue

## Backend en Render

1. Crea un nuevo Blueprint en Render usando `render.yaml`, o crea un Web Service manual con:
   - Root directory: `Backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Health check path: `/health`

2. Configura variables de entorno:
   - `FRONTEND_ORIGINS=https://TU-SITIO.netlify.app`
   - `SQLITE_DB_PATH=/var/data/gps_data.sqlite3`
   - `GOOGLE_MAPS_API_KEY=...` si quieres trafico de Google

3. Si quieres conservar favoritos y recientes entre deploys, usa el disco persistente definido en `render.yaml`.

## Frontend en Netlify

1. Crea el sitio apuntando al repositorio completo.
2. Netlify usara `netlify.toml`:
   - Base directory: `raiz`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Configura variables de entorno:
   - `VITE_API_BASE_URL=https://TU-BACKEND.onrender.com`
   - `VITE_WS_BASE_URL=wss://TU-BACKEND.onrender.com`

4. Despues de tener la URL final de Netlify, actualiza `FRONTEND_ORIGINS` en Render con esa URL exacta.

## Local

Localmente no necesitas esas variables del frontend. Vite sigue usando el proxy de `vite.config.js` hacia `http://127.0.0.1:8001`.
