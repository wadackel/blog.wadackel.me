import React from 'react';
import { PageProps } from 'gatsby';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { SiteMetadata } from '../../types';
import styles from './App.module.css';

export type Props = {
  location: PageProps['location'];
  metadata: SiteMetadata;
};

export const App: React.FC<Props> = ({ location, metadata, children }) => {
  return (
    <>
      <div className={styles.page}>
        <Header home={location.pathname === '/'} />

        <main>{children}</main>
      </div>

      <Footer metadata={metadata} />
    </>
  );
};
