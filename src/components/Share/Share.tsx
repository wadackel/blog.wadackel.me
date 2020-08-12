import React, { useMemo, useCallback } from 'react';
import classNames from 'classnames/bind';
import { TwitterIcon, HatenaIcon, PocketIcon, FeedlyIcon } from '../icons';
import styles from './Share.module.css';

const cx = classNames.bind(styles);

export type Props = {
  title: string;
  siteUrl: string;
  slug: string;
};

export const Share: React.FC<Props> = ({ title, siteUrl, slug }) => {
  const url = siteUrl + slug;

  const encoded = useMemo(
    () => ({
      title: encodeURIComponent(title),
      url: encodeURIComponent(url),
    }),
    [title, url],
  );

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const button = e.currentTarget;
    const href = encodeURI(decodeURI(button.href));
    const name = button.dataset.name;
    const width = parseInt(button.dataset.width!, 10);
    const height = parseInt(button.dataset.height!, 10);

    window.open(
      href,
      name,
      [
        `width=${width}`,
        `height=${height}`,
        'personalbar=no',
        'menubar=no',
        'toolbar=no',
        'scrollbars=yes',
        'resizable=yes',
      ].join(', '),
    );
  }, []);

  return (
    <ul className={styles.wrapper}>
      <li className={styles.item}>
        <a
          className={cx({ button: true, isTwitter: true })}
          target="_blank"
          rel="noopener noreferrer"
          href={`http://twitter.com/intent/tweet?text=${encoded.title}%0a${url}`}
          aria-label="この記事をTwitterでシェアする"
          data-name="tweetwindow"
          data-width="550"
          data-height="450"
          onClick={handleClick}
        >
          <TwitterIcon size={16} />
        </a>
      </li>

      <li className={styles.item}>
        <a
          className={cx({ button: true, isHatena: true })}
          target="_blank"
          rel="noopener noreferrer"
          href={`http://b.hatena.ne.jp/add?mode=confirm&url=${url}&title=${encoded.title}`}
          aria-label="この記事をはてなブックマークに追加する"
          data-name="hatenawindow"
          data-width="500"
          data-height="450"
          onClick={handleClick}
        >
          <HatenaIcon size={16} />
        </a>
      </li>

      <li className={styles.item}>
        <a
          className={cx({ button: true, isPocket: true })}
          target="_blank"
          rel="noopener noreferrer"
          href={`http://getpocket.com/edit?url=${url}&title=${encoded.title}`}
          aria-label="この記事をPocketに追加する"
          data-name="pocketwindow"
          data-width="550"
          data-height="350"
          onClick={handleClick}
        >
          <PocketIcon size={16} />
        </a>
      </li>

      <li className={styles.item}>
        <a
          className={cx({ button: true, isFeedly: true })}
          target="_blank"
          rel="noopener noreferrer"
          href={`https://feedly.com/i/subscription/feed%2F${siteUrl}`}
          aria-label="このブログをFeedlyに追加する"
        >
          <FeedlyIcon size={16} />
        </a>
      </li>
    </ul>
  );
};
