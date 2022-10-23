import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'gatsby';
import { MarkdownRemark } from '../../types';
import styles from './Pager.module.css';

const cx = classNames.bind(styles);

export type Props = {
  previous: MarkdownRemark | null;
  next: MarkdownRemark | null;
};

export const Pager: React.FC<Props> = ({ previous, next }) => {
  if (previous == null && next == null) {
    return null;
  }

  return (
    <nav className={styles.wrapper} aria-label="前後記事のナビゲーション">
      {next ? (
        <Link
          className={cx({ item: true, isNext: true })}
          to={next.fields.slug}
        >
          <span className={styles.item_label}>Newer Post</span>
          <span className={styles.item_title}>{next.frontmatter.title}</span>
        </Link>
      ) : (
        <span className={cx({ item: true, isNext: true, isDisabled: true })} />
      )}

      {previous ? (
        <Link
          className={cx({ item: true, isPrevious: true })}
          to={previous.fields.slug}
        >
          <span className={styles.item_label}>Older Post</span>
          <span className={styles.item_title}>
            {previous.frontmatter.title}
          </span>
        </Link>
      ) : (
        <span
          className={cx({ item: true, isPrevious: true, isDisabled: true })}
        />
      )}
    </nav>
  );
};
