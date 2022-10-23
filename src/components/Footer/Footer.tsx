import React, { useMemo } from 'react';
import { Container } from '../Container';
import { Logo } from '../Logo';
import { SiteMetadata } from '../../types';
import { TwitterIcon, GitHubIcon, FeedlyIcon, FeedIcon } from '../icons';
import styles from './Footer.module.css';

export type Props = {
  metadata: SiteMetadata;
};

export const Footer: React.FC<Props> = ({ metadata }) => {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className={styles.wrapper}>
      <Container>
        <div className={styles.inner}>
          <div className={styles.avatar}>
            <div className={styles.icon}>
              <Logo />
            </div>
          </div>

          <p className={styles.author}>
            <span>和田 剛</span>
            <span>tsuyoshi wada</span>
          </p>

          <p className={styles.summary}>ダックスフンド is かわいい。</p>

          <ul className={styles.social}>
            <li className={styles.social_item}>
              <a href={`https://twitter.com/${metadata.social.twitter}`}>
                <TwitterIcon size={20} />
              </a>
            </li>

            <li className={styles.social_item}>
              <a href={`https://github.com/${metadata.social.github}`}>
                <GitHubIcon size={20} />
              </a>
            </li>

            <li className={styles.social_item}>
              <a
                href={`http://cloud.feedly.com/#subscription%2Ffeed%2F${encodeURIComponent(
                  `${metadata.siteUrl}/index.xml`,
                )}`}
              >
                <FeedlyIcon size={20} />
              </a>
            </li>

            <li className={styles.social_item}>
              <a href={`${metadata.siteUrl}/index.xml`}>
                <FeedIcon size={20} />
              </a>
            </li>
          </ul>

          <p className={styles.copyright}>
            &copy; {year} {metadata.title}
          </p>
        </div>
      </Container>
    </div>
  );
};
