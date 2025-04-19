import type { FunctionComponent, JSX } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import { FeedlyIcon } from '../icons/FeedlyIcon';
import { HatenaIcon } from '../icons/HatenaIcon';
import { PocketIcon } from '../icons/PocketIcon';
import { XIcon } from '../icons/XIcon';
import styles from './Share.module.css';

export type Props = {
  title: string;
  url: string;
};

export const Share: FunctionComponent<Props> = ({ title, url: urlProp }) => {
  const url = useMemo(() => new URL(urlProp), [urlProp]);

  const encoded = useMemo(
    () => ({
      title: encodeURIComponent(title),
      url: encodeURIComponent(url.toString()),
    }),
    [title, url],
  );

  const handleClick = useCallback((e: JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
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
    <ul className={styles.list}>
      <li className={styles.item}>
        <a
          className={`${styles.button} ${styles['is-x']}`}
          target="_blank"
          rel="noopener noreferrer"
          href={`http://twitter.com/intent/tweet?text=${encoded.title}%0a${url}`}
          aria-label="この記事をXでシェアする"
          data-name="tweetwindow"
          data-width="550"
          data-height="450"
          onClick={handleClick}
        >
          <XIcon size={16} />
        </a>
      </li>

      <li className={styles.item}>
        <a
          className={`${styles.button} ${styles['is-hatena']}`}
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
          className={`${styles.button} ${styles['is-pocket']}`}
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
          className={`${styles.button} ${styles['is-feedly']}`}
          target="_blank"
          rel="noopener noreferrer"
          href={`https://feedly.com/i/subscription/feed%2F${url.origin}`}
          aria-label="このブログをFeedlyに追加する"
        >
          <FeedlyIcon size={16} />
        </a>
      </li>
    </ul>
  );
};
