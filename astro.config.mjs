import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import remarkA11yEmoji from '@fec/remark-a11y-emoji';
// import compress from 'astro-compress';
import { defineConfig, passthroughImageService } from 'astro/config';
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
import { remarkUrlEmbed } from './plugins/remark-url-embed.mjs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

let site = 'http://localhost:3000';
if (process.env.CF_PAGES_BRANCH === 'main') {
  site = 'https://blog.wadackel.me';
} else if (process.env.CF_PAGES_URL != null) {
  site = process.env.CF_PAGES_URL;
}

// https://astro.build/config
export default defineConfig({
  site,
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
    // compress({
    //   img: false,
    // }),
  ],
  image: {
    service: passthroughImageService(),
  },
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
      remarkUrlEmbed,
      remarkTwitterPlugin,
      remarkDefaultLayoutPlugin,
      remarkExcerptPlugin,
      remarkCodeBlockPlugin,
      remarkTablePlugin,
      remarkImagePlugin,
    ],
  },
});
