export type SiteMetadata = {
  title: string;
  description: string;
  siteUrl: string;
  social: {
    twitter: string;
    github: string;
  };
};

export type Frontmatter = {
  title: string;
  date: string;
};

export type MarkdownRemark = {
  id: string;
  excerpt: string;
  html: string;
  frontmatter: Frontmatter;
  fields: {
    slug: string;
  };
};
