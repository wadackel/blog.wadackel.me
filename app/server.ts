import { showRoutes } from 'hono/dev';
import { createApp } from 'honox/server';
import { trimTrailingSlash } from 'hono/trailing-slash';

const app = createApp({
  init: (app) => {
    // Middleware to remove trailing slashes (only works for 404s)
    app.use(trimTrailingSlash());
  },
});

showRoutes(app);

export default app;
