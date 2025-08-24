import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  root: process.cwd(),
  publicDir: 'public',
  optimizeDeps: {
    include: ['hono/jsx/jsx-dev-runtime', 'hono/jsx/dom/server'],
  },
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
      screenshotFailures: false,
      screenshotDirectory: './screenshots',
      instances: [
        {
          browser: 'chromium',
          viewport: { width: 800, height: 600 },
        },
      ],
    },
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
});
