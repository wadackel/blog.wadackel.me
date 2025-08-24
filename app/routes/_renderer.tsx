import { jsxRenderer } from 'hono/jsx-renderer';
import { Script, Link, HasIslands } from 'honox/server';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { site } from '../../lib/config';

interface OGPData {
  title: string;
  description: string;
  url: string;
  image: string;
  type?: string;
}

export default jsxRenderer(({ children }, c) => {
  const title = c?.get('title') as string | undefined;
  const description = c?.get('description') as string | undefined;
  const ogp = c?.get('ogp') as OGPData | undefined;
  const type = (c?.get('type') as string) || 'website';
  const currentUrl = c.req.url;

  return (
    <html lang="ja-JP">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="format-detection" content="telephone=no, address=no, email=no" />
        <meta name="title" content={title || site.title} />
        {description && <meta name="description" content={description} />}
        {type === '404' ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow" />
        )}

        <title>{title || site.title}</title>

        <link rel="canonical" href={currentUrl} />

        {/* OGP meta tags */}
        {ogp ? (
          <>
            <meta property="og:title" content={ogp.title} />
            <meta property="og:description" content={ogp.description} />
            <meta property="og:url" content={ogp.url} />
            <meta property="og:image" content={ogp.image} />
            <meta property="og:type" content={ogp.type || 'website'} />
            <meta property="og:site_name" content={site.title} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={`@${site.social.x}`} />
            <meta name="twitter:creator" content={`@${site.social.x}`} />
            <meta name="twitter:url" content={ogp.url} />
          </>
        ) : (
          <>
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={title || site.title} />
            {description && <meta property="og:description" content={description} />}
            <meta property="og:image" content={new URL('/ogp.png', site.url).toString()} />
            <meta property="og:site_name" content={site.title} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={`@${site.social.x}`} />
            <meta name="twitter:creator" content={`@${site.social.x}`} />
            <meta name="twitter:url" content={currentUrl} />
          </>
        )}

        <link rel="icon" type="image/vnd.microsoft.icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={site.title}
          href={new URL('/rss.xml', site.url).toString()}
        />
        <meta name="theme-color" content="#fff" />

        {/* Google tag (gtag.js) */}
        {import.meta.env.PROD && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${site.trackingId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${site.trackingId}');
                `,
              }}
            />
          </>
        )}

        {import.meta.env.PROD ? (
          <HasIslands>
            <Script src="/app/client.ts" />
          </HasIslands>
        ) : (
          <Script src="/app/client.ts" />
        )}
        <Link href="/app/style.css" rel="stylesheet" />
        <Link href="/app/fonts.css" rel="stylesheet" />
        <link
          rel="preload"
          href="/fonts/caveat-header.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/caveat-comprehensive.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div class="relative z-20 overflow-hidden bg-white mb-footer shadow-lg">
          <Header home={title === 'wadackel.me'} />

          <main>{children}</main>
        </div>

        <div class="fixed bottom-0 inset-x-0 z-10 w-full h-footer">
          <Footer />
        </div>
      </body>
    </html>
  );
});
