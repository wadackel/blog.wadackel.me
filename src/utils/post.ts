import type { MarkdownPostData } from '../types';

export const sortPostList = (posts: MarkdownPostData[]): MarkdownPostData[] => {
  return posts.sort(
    (a, b) => new Date(b.frontmatter.date).valueOf() - new Date(a.frontmatter.date).valueOf(),
  );
};
