import React from 'react';
import dayjs from 'dayjs';
import { Link } from 'gatsby';
import { MarkdownRemark } from '../../types';
import styles from './Article.module.css';

export type Props = {
  single: boolean;
  data: MarkdownRemark;
};

export const Article: React.FC<Props> = ({ single, data }) => {
  const date = dayjs(data.frontmatter.date);

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        {single ? (
          <h1 className={styles.title}>{data.frontmatter.title}</h1>
        ) : (
          <h2 className={styles.title}>
            <Link to={data.fields.slug}>{data.frontmatter.title}</Link>
          </h2>
        )}

        <p className={styles.meta}>
          <span className={styles.date}>
            Published{' '}
            <time dateTime={date.format('YYYY-MM-DD')}>
              {date.format('MMMM DD, YYYY')}
            </time>
          </span>
        </p>
      </header>

      {single ? (
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      ) : (
        <p className={styles.excerpt}>{data.excerpt}</p>
      )}
    </article>
  );
};
