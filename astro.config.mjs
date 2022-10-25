// import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import remarkA11yEmoji from '@fec/remark-a11y-emoji';
import compress from 'astro-compress';
import { defineConfig } from 'astro/config';
import path from 'path';
import remarkAutolinkHeadings from 'remark-autolink-headings';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import { createAstroCopyImages } from './integrations/astro-copy-images';
import { createAstroOgimage } from './integrations/astro-ogimage';
import { remarkCodeBlockPlugin } from './plugins/remark-code-block.mjs';
import { remarkDefaultLayoutPlugin } from './plugins/remark-default-layout.mjs';
import { remarkExcerptPlugin } from './plugins/remark-excerpt.mjs';
import { remarkImagePlugin } from './plugins/remark-image.mjs';
import { remarkTablePlugin } from './plugins/remark-table.mjs';
import { remarkTwitterPlugin } from './plugins/remark-twitter.mjs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// https://astro.build/config
export default defineConfig({
  site: process.env.CF_PAGES_URL ?? 'http://localhost:3000',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    preact(),
    tailwind(),
    sitemap(),
    createAstroCopyImages({
      src: path.resolve(__dirname, 'src/pages'),
      dist: path.resolve(__dirname, 'dist'),
    }),
    createAstroOgimage({
      dist: path.resolve(__dirname, 'dist'),
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    compress({
      img: false,
    }),
  ],
  markdown: {
    syntaxHighlight: false,
    extendDefaultPlugins: false,
    remarkRehype: {
      footnoteLabel: ' ',
      footnoteLabelTagName: 'hr',
    },
    remarkPlugins: [
      remarkSlug,
      [
        remarkAutolinkHeadings,
        {
          behavior: 'append',
          content: {},
        },
      ],
      remarkEmoji,
      remarkA11yEmoji,
      remarkGfm,
      remarkTwitterPlugin,
      remarkDefaultLayoutPlugin,
      remarkExcerptPlugin,
      remarkCodeBlockPlugin,
      remarkTablePlugin,
      remarkImagePlugin,
    ],
  },
});
