import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendHttp = 'http://127.0.0.1:8001';
const backendWs = 'ws://127.0.0.1:8001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/route': {
        target: backendHttp,
        changeOrigin: true
      },
      '/routes': {
        target: backendHttp,
        changeOrigin: true
      },
      '/geocode': {
        target: backendHttp,
        changeOrigin: true
      },
      '/alerts': {
        target: backendHttp,
        changeOrigin: true
      },
      '/telemetry': {
        target: backendHttp,
        changeOrigin: true
      },
      '/health': {
        target: backendHttp,
        changeOrigin: true
      },
      '/red-zones': {
        target: backendHttp,
        changeOrigin: true
      },
      '/weather': {
        target: backendHttp,
        changeOrigin: true
      },
      '/ws': {
        target: backendWs,
        ws: true
      }
    }
  }
});
