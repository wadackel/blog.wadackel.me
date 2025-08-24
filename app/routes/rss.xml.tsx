import type { Context } from 'hono';
import { getAllPosts } from '../../lib/posts';
import { site } from '../../lib/config';

export default async function RSS(c: Context) {
  const baseUrl = site.url;
  const lastBuildDate = new Date().toUTCString();

  // All posts
  const allPosts = await getAllPosts();

  const rssItems = allPosts
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const link = `${baseUrl}/${post.slug}`;

      return `<item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ''}
    </item>`;
    })
    .join('\n    ');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${site.title}</title>
    <description>${site.description}</description>
    <link>${baseUrl}</link>
    <language>${site.lang}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return c.body(rss, 200, {
    'Content-Type': 'application/xml; charset=UTF-8',
  });
}
