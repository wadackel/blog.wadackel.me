import { graphql, PageProps } from 'gatsby';
import React from 'react';
import { Container } from '../components/Container';
import { MarkdownRemark, SiteMetadata } from '../types';
import { App } from '../components/App';
import { Head } from '../components/Head';
import { Article } from '../components/Article';
import { Pagination } from '../components/Pagination';

type Props = PageProps<
  {
    site: {
      siteMetadata: SiteMetadata;
    };
    allMarkdownRemark: {
      edges: {
        node: MarkdownRemark;
      }[];
    };
  },
  {
    humanPageNumber: number;
    limit: number;
    nextPagePath: string;
    numberOfPages: number;
    pageNumber: number;
    previousPagePath: string;
    skip: number;
  }
>;

const BlogIndex: React.FC<Props> = ({ data, location, pageContext }) => {
  const metadata = data.site.siteMetadata;
  const articles = data.allMarkdownRemark.edges;

  return (
    <App location={location} metadata={metadata}>
      <Head type="homepage" metadata={metadata} />

      <Container>
        {articles.map(({ node }) => (
          <Article key={node.fields.slug} single={false} data={node} />
        ))}

        <Pagination
          page={pageContext.humanPageNumber}
          total={pageContext.numberOfPages}
          previous={pageContext.previousPagePath || null}
          next={pageContext.nextPagePath || null}
        />
      </Container>
    </App>
  );
};

export default BlogIndex;

export const pageQuery = graphql`
  query($skip: Int!, $limit: Int!) {
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
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      skip: $skip
      limit: $limit
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            title
            date
          }
        }
      }
    }
  }
`;
