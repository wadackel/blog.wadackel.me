import React from 'react';
import { graphql, PageProps, Link } from 'gatsby';
import { SiteMetadata } from '../types';
import { App } from '../components/App';
import { Head } from '../components/Head';
import { Container } from '../components/Container';
import styles from './404.module.css';

type Props = PageProps<{
  site: {
    siteMetadata: SiteMetadata;
  };
}>;

const NotFound: React.FC<Props> = ({ data, location }) => {
  const metadata = data.site.siteMetadata;

  return (
    <App location={location} metadata={metadata}>
      <Head type="notfound" metadata={metadata} />

      <Container>
        <h1 className={styles.title}>404 - Page not found</h1>
        <p className={styles.meta}>Sorry this page does not exist</p>
        <div className={styles.body}>
          <p>
            お探しのページは一時的にアクセスができない状況にあるか、削除・変更された可能性があります。
          </p>
          <p>
            <Link to="/">トップページへ戻る</Link>
          </p>
        </div>
      </Container>
    </App>
  );
};

export default NotFound;

export const pageQuery = graphql`
  query {
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
  }
`;
