import React from 'react';
import { Helmet } from 'react-helmet';
import { helmetJsonLdProp } from 'react-schemaorg';
import { Blog, BlogPosting } from 'schema-dts';
import dayjs from 'dayjs';
import { SiteMetadata, MarkdownRemark } from '../../types';

export type PageType = 'homepage' | 'article' | 'notfound';

export type Props = {
  type: PageType;
  metadata: SiteMetadata;
  article?: MarkdownRemark;
};

export const Head: React.FC<Props> = ({
  type,
  metadata,
  article,
  children,
}) => {
  const seo = {
    title: '',
    url: '',
    description: '',
  };

  const author = {
    '@type': 'Person',
    name: metadata.social.twitter,
    image: [
      `${metadata.siteUrl}/favicon.png`,
      `${metadata.siteUrl}/icon144.png`,
      `${metadata.siteUrl}/icon512.png`,
    ],
  } as const;

  const publisher = {
    '@type': 'Organization',
    name: metadata.social.twitter,
    description: metadata.description,
    image: author.image,
    logo: {
      '@type': 'ImageObject',
      url: `${metadata.siteUrl}/icon144.png`,
    },
  } as const;

  const jsonLd = [
    helmetJsonLdProp<Blog>({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: metadata.title,
      author,
      publisher,
      inLanguage: 'ja',
      url: metadata.siteUrl,
    }),
  ];

  switch (type) {
    case 'homepage': {
      seo.title = `${metadata.title} - ${metadata.description}`;
      seo.url = metadata.siteUrl;
      seo.description = metadata.description;
      break;
    }

    case 'notfound': {
      seo.title = `404 Page not found - ${metadata.description}`;
      seo.url = metadata.siteUrl;
      seo.description = metadata.description;
      break;
    }

    case 'article': {
      seo.title = `${article!.frontmatter.title} - ${metadata.title}`;
      seo.url = metadata.siteUrl + article!.fields.slug;
      seo.description = article!.excerpt;

      jsonLd.push(
        helmetJsonLdProp<BlogPosting>({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          author,
          publisher,
          datePublished: dayjs(article!.frontmatter.date).toISOString(),
          headline: seo.title,
          description: seo.description,
          image: [`${metadata.siteUrl}/wadackelme.png`],
        }),
      );
      break;
    }
  }

  return (
    <Helmet defer={false} title={seo.title} script={jsonLd}>
      <html lang="ja-JP" />

      {type === 'notfound' && (
        <meta name="robots" content="noindex , nofollow" />
      )}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta charSet="utf-8" />
      <meta
        name="format-detection"
        content="telephone=no,address=no,email=no"
      />
      <meta name="description" content={seo.description} />
      <meta name="author" content={metadata.social.twitter} />
      <meta name="theme-color" content="#fff" />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:site" content={`@${metadata.social.twitter}`} />
      <meta name="twitter:image" content={publisher.image[0]} />

      <link rel="me" href={`https://twitter.com/${metadata.social.twitter}`} />
      <link rel="canonical" href={seo.url} />
      <link rel="icon" type="image/vnd.microsoft.icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />

      {children}
    </Helmet>
  );
};
