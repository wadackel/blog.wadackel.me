import { getAllPosts } from '../../lib/posts';
import type { HonoContext } from '../global';

type SitemapPage = {
  url: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
};

export default async function Sitemap(c: HonoContext) {
  const baseUrl = 'https://wadackel.me';
  const lastmod = new Date().toISOString().split('T')[0];

  const allPosts = await getAllPosts();

  // Static pages
  const staticPages: SitemapPage[] = [
    {
      url: `${baseUrl}/`,
      priority: '1.0',
      changefreq: 'weekly',
    },
  ];

  // Post pages
  const postPages: SitemapPage[] = allPosts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: post.date,
  }));

  // Pagination
  const totalPages = Math.ceil(allPosts.length / 10);
  const paginationPages: SitemapPage[] = Array.from({ length: totalPages - 1 }, (_, i) => ({
    url: `${baseUrl}/page/${i + 2}`,
    priority: '0.6',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...postPages, ...paginationPages];

  const sitemapEntries = allPages
    .map(
      (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod || lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}
</urlset>`;

  c.header('Content-Type', 'application/xml; charset=UTF-8');
  return c.text(sitemap);
}
