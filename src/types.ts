import type { MarkdownInstance } from 'astro';

export type PostData = {
  title: string;
  date: string;
  image?: string;
  excerpt: string;
};

export type MarkdownPostData = MarkdownInstance<PostData>;
