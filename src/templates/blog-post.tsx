import React from 'react';
import { graphql, PageProps } from 'gatsby';
import { MarkdownRemark, SiteMetadata } from '../types';
import { App } from '../components/App';
import { Article } from '../components/Article';
import { Container } from '../components/Container';
import { Head } from '../components/Head';
import { Share } from '../components/Share';
import { Pager } from '../components/Pager';

type Props = PageProps<
  {
    site: {
      siteMetadata: SiteMetadata;
    };
    markdownRemark: MarkdownRemark;
  },
  {
    slug: string;
    previous: MarkdownRemark;
    next: MarkdownRemark;
  }
>;

const BlogPostTemplate: React.FC<Props> = ({ location, data, pageContext }) => {
  const metadata = data.site.siteMetadata;
  const article = data.markdownRemark;
  const { previous, next } = pageContext;

  return (
    <App location={location} metadata={metadata}>
      <Head type="article" metadata={metadata} article={article} />

      <Container>
        <Article single data={article} />

        <Share
          title={`${article.frontmatter.title} - ${metadata.title}`}
          siteUrl={metadata.siteUrl}
          slug={article.fields.slug}
        />
      </Container>

      <Pager previous={previous} next={next} />
    </App>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        description
        siteUrl
        social {
          twitter
          github
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      fields {
        slug
      }
      frontmatter {
        title
        date
      }
    }
  }
`;
