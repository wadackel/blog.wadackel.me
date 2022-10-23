import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'gatsby';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';
import styles from './Pagination.module.css';

const cx = classNames.bind(styles);

export type Props = {
  page: number;
  total: number;
  previous: string | null;
  next: string | null;
};

export const Pagination: React.FC<Props> = ({
  page,
  total,
  previous,
  next,
}) => {
  return (
    <nav className={styles.wrapper} aria-label="ページ送りナビゲーション">
      {previous ? (
        <Link
          className={cx({ item: true, isPrevious: true })}
          to={previous}
          aria-label="新しい記事へ遷移"
        >
          <ArrowLeftIcon size={16} />
        </Link>
      ) : (
        <a
          className={cx({ item: true, isPrevious: true })}
          aria-disabled="true"
          aria-label="新しい記事へ遷移"
        >
          <ArrowLeftIcon size={16} />
        </a>
      )}

      <span className={styles.number}>
        Page {page} of {total}
      </span>

      {next ? (
        <Link
          className={cx({ item: true, isNext: true })}
          to={next}
          aria-label="古い記事へ遷移"
        >
          <ArrowRightIcon size={16} />
        </Link>
      ) : (
        <a
          className={cx({ item: true, isNext: true })}
          aria-disabled="true"
          aria-label="古い記事へ遷移"
        >
          <ArrowRightIcon size={16} />
        </a>
      )}
    </nav>
  );
};
