import type { Plugin, ViteDevServer } from 'vite';

/**
 * Vite plugin to handle Hot Module Replacement for content files
 */
export const contentHMR = (): Plugin => {
  let server: ViteDevServer;
  let isProcessing = false; // Prevent duplicate processing

  return {
    name: 'content-hmr',
    enforce: 'pre', // Run before other plugins

    configureServer(_server) {
      server = _server;
    },

    async handleHotUpdate({ file }) {
      // Only handle markdown files in content directory
      if (!file.includes('/content/') || !file.endsWith('.md')) {
        return; // Let other plugins handle
      }

      // Prevent duplicate processing
      if (isProcessing) {
        return [];
      }

      isProcessing = true;

      try {
        // Small delay to ensure file write is complete
        await new Promise((r) => setTimeout(r, 100));

        // Clear all caches to ensure fresh data
        const { clearCache } = await import('./posts.js');
        clearCache();

        // Trigger reload
        server.ws.send({
          type: 'full-reload',
          path: '*',
        });
      } catch (error) {
        console.error('[content-hmr] Error handling hot update:', error);
      } finally {
        // Reset processing flag
        setTimeout(() => {
          isProcessing = false;
        }, 50);
      }

      // Return empty array to prevent default HMR
      return [];
    },
  };
};
