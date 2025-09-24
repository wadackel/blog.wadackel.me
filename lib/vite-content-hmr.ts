import type { Plugin, ViteDevServer } from 'vite';

/**
 * Vite plugin to handle Hot Module Replacement for content files
 * Simplified version to prevent HMR conflicts
 */
export const contentHMR = (): Plugin => {
  let server: ViteDevServer;

  return {
    name: 'content-hmr',
    enforce: 'pre', // Run before other plugins

    configureServer(_server) {
      server = _server;
    },

    handleHotUpdate({ file }) {
      // Only handle markdown files in content directory
      if (!file.includes('/content/') || !file.endsWith('.md')) {
        return;
      }

      // Async operation to handle the update
      (async () => {
        try {
          // Small delay to ensure file write is complete
          await new Promise((r) => setTimeout(r, 100));

          // Clear all caches to ensure fresh data
          const { clearCache } = await import('./posts.js');
          clearCache();

          // Trigger full reload
          server.ws.send({
            type: 'full-reload',
            path: '*',
          });

          console.log('[content-hmr] Reloaded after content change:', file);
        } catch (error) {
          console.error('[content-hmr] Error handling hot update:', error);
        }
      })().catch(console.warn);

      // Return empty array immediately to prevent default HMR
      return [];
    },
  };
};
