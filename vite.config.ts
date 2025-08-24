import build from '@hono/vite-build/cloudflare-workers';
import adapter from '@hono/vite-dev-server/cloudflare';
import ssg from '@hono/vite-ssg';
import honox from 'honox/vite';
import client from 'honox/vite/client';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type PluginOption } from 'vite';
import { copyContentImages } from './lib/vite-copy-content-images';
import { viteOGImagePlugin } from './lib/vite-ogimage-plugin';
import { contentHMR } from './lib/vite-content-hmr';

const entry = './app/server.ts';

// Common plugin configuration
const commonPlugins: PluginOption[] = [tailwindcss()];

// SSR external dependencies configuration (same approach as sample project)
const ssrExternal = [
  '@fec/remark-a11y-emoji',
  'fast-glob',
  'graphemesplit',
  'hast-util-to-html',
  'mdast-util-to-string',
  'parse-numeric-range',
  'prismjs',
  'rehype-stringify',
  'remark-autolink-headings',
  'remark-emoji',
  'remark-extract-frontmatter',
  'remark-frontmatter',
  'remark-gfm',
  'remark-parse',
  'remark-rehype',
  'remark-slug',
  'to-vfile',
  'unified',
  'unist-util-visit',
  'vfile',
  'vfile-matter',
  'yaml',
];

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [
        ...commonPlugins,
        client({
          input: ['./app/style.css'],
        }),
      ],
    };
  } else {
    return {
      build: {
        emptyOutDir: false, // To combine with client build
      },
      ssr: {
        external: ssrExternal,
      },
      plugins: [
        contentHMR(),
        copyContentImages(),
        viteOGImagePlugin({
          contentDir: 'content',
          outputDir: 'dist',
        }),
        honox({
          devServer: { adapter },
        }),
        ...commonPlugins,
        build({
          output: 'index.js',
        }),
        ssg({ entry }),
      ],
      server: {
        port: 4321,
        watch: {
          ignored: ['!content/**/*', '!lib/**/*', '!components/**/*', '!app/**/*', '!plugins/**/*'],
        },
      },
      preview: {
        port: 4321,
      },
    };
  }
});
