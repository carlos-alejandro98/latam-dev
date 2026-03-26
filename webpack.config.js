const createExpoWebpackConfigAsync = require('@expo/webpack-config');

/**
 * Custom webpack config for Expo Web.
 *
 * In development, the browser sends requests from http://localhost:8081.
 * The backend does NOT allow that origin (CORS), so we proxy all /api/*
 * requests through the webpack dev server — which forwards them
 * server-side, bypassing the browser's CORS restriction entirely.
 *
 * In production (expo export --platform web) this file is ignored;
 * the deployed web app hits the API directly from the allowed origin.
 */
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  const FLIGHTS_API =
    process.env.EXPO_PUBLIC_FLIGHTS_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'https://gantt-backend-dev-854106909582.us-east1.run.app';

  const MAIN_API =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'https://gantt-backend-dev-854106909582.us-east1.run.app';

  if (config.devServer) {
    config.devServer.proxy = {
      // Proxy all /api/* calls to the real backend
      '/api': {
        target: FLIGHTS_API !== MAIN_API ? FLIGHTS_API : MAIN_API,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
        onError(err, _req, res) {
          console.error('[proxy] error:', err.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Proxy error', detail: err.message }));
        },
      },
    };
  }

  return config;
};
