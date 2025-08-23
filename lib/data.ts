import type { Post, PostMeta } from './types';

// Mock data for now - will be replaced with actual data loading
const mockPosts: PostMeta[] = [
  {
    title: 'HonoXブログのテスト記事',
    date: '2025-08-10',
    slug: '2025/test-post',
    path: '2025/test-post/index.md',
    excerpt: 'これはHonoXブログのテスト記事です。',
  },
];

const mockPostsContent: Record<string, Post> = {
  '2025/test-post': {
    title: 'HonoXブログのテスト記事',
    date: '2025-08-10',
    slug: '2025/test-post',
    path: '2025/test-post/index.md',
    excerpt: 'これはHonoXブログのテスト記事です。',
    html: '<p>これはテスト記事のコンテンツです。</p>',
  },
};

export const getAllPosts = (): PostMeta[] => {
  return mockPosts;
};

export const getPostBySlug = (slug: string): Post | null => {
  return mockPostsContent[slug] || null;
};

export const getPostsByPage = (
  page: number,
  perPage: number = 10,
): {
  posts: PostMeta[];
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
} => {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    posts: allPosts.slice(start, end),
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
