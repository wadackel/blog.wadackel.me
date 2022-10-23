import rss from '@astrojs/rss';
import { site } from '../config';

const postImportResult = import.meta.glob('./**/*.{md,mdx}', { eager: true });
const posts = Object.values(postImportResult);

export const get = () =>
  rss({
    title: site.title,
    description: site.description,
    site: import.meta.env.SITE,
    items: posts.map((post) => ({
      link: post.url,
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      pubDate: post.frontmatter.date,
    })),
  });
