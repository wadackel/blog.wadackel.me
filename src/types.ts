import type { MarkdownInstance } from 'astro';

export type PostData = {
  title: string;
  date: string;
  excerpt: string;
};

export type MarkdownPostData = MarkdownInstance<PostData>;
