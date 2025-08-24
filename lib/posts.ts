import type { Post, PostMeta } from './types';

// Server-side only imports (Node.js specific modules)
let readFile: (typeof import('node:fs/promises'))['readFile'];
let join: (typeof import('node:path'))['join'];
let dirname: (typeof import('node:path'))['dirname'];
let fileURLToPath: (typeof import('node:url'))['fileURLToPath'];
let MarkdownProcessor: (typeof import('./markdown'))['MarkdownProcessor'];
let fg: typeof import('fast-glob');

// Lazy load Node.js modules only on server side
const ensureServerModules = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('Posts functions can only be used on server side');
  }

  if (!readFile) {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const url = await import('node:url');
    const markdownModule = await import('./markdown');
    const fastGlob = await import('fast-glob');

    readFile = fs.readFile;
    join = (...paths) => path.join(...paths);
    dirname = (filepath) => path.dirname(filepath);
    fileURLToPath = url.fileURLToPath;
    MarkdownProcessor = markdownModule.MarkdownProcessor;
    fg = fastGlob.default;
  }
};

// Fast markdown file discovery using fast-glob
const findMarkdownFiles = async (contentDir: string): Promise<string[]> => {
  await ensureServerModules();

  // Use fast-glob to find all index.md files in year/slug structure
  // Pattern: */*/index.md finds index.md files exactly 2 levels deep (year/slug/)
  const files = await fg('**/index.md', {
    cwd: contentDir,
    absolute: false,
  });

  return files;
};

let __dirname: string;
let CONTENT_DIR: string;
let markdownProcessor: InstanceType<typeof MarkdownProcessor>;

const getContentDir = async () => {
  if (!__dirname) {
    await ensureServerModules();
    const __filename = fileURLToPath(import.meta.url);
    __dirname = dirname(__filename);
    CONTENT_DIR = join(__dirname, '../content');
    markdownProcessor = new MarkdownProcessor();
  }
  return CONTENT_DIR;
};

// Cache for development performance
let postsCache: PostMeta[] | null = null;
let postsContentCache: Record<string, Post> | null = null;

// Common function to process a single markdown file
async function processMarkdownFile(
  file: string,
  contentDir: string,
  includeHtml: false,
): Promise<PostMeta>;
async function processMarkdownFile(
  file: string,
  contentDir: string,
  includeHtml: true,
): Promise<Post>;
async function processMarkdownFile(
  file: string,
  contentDir: string,
  includeHtml: boolean = false,
): Promise<PostMeta | Post> {
  const filepath = join(contentDir, file);
  const slug = dirname(file);
  const content = await readFile(filepath, 'utf-8');

  // Process markdown with full unified/remark pipeline
  const processed = await markdownProcessor.process(content, filepath);

  const basePost = {
    title: processed.frontmatter.title ?? slug,
    date: processed.frontmatter.date ?? new Date().toISOString().split('T')[0],
    excerpt: processed.excerpt ?? (processed.frontmatter['excerpt'] as string) ?? '',
    slug,
    path: file,
    image: processed.frontmatter['image'] as string | undefined,
  } as PostMeta;

  return includeHtml ? ({ ...basePost, html: processed.html } as Post) : basePost;
}

export const getAllPosts = async (): Promise<PostMeta[]> => {
  if (postsCache) {
    return postsCache;
  }

  await ensureServerModules();
  const contentDir = await getContentDir();

  // Find all markdown files
  const files = await findMarkdownFiles(contentDir);

  const posts: PostMeta[] = await Promise.all(
    files.map((file) => processMarkdownFile(file, contentDir, false)),
  );

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  postsCache = posts;
  return posts;
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  // In development, always read fresh from disk to ensure HMR works correctly
  if (import.meta.env.DEV) {
    return await getPostBySlugDirect(slug);
  }

  if (!postsContentCache) {
    await buildContentCache();
  }

  return postsContentCache?.[slug] || null;
};

// Direct file system read for development (ensures HMR works correctly)
const getPostBySlugDirect = async (slug: string): Promise<Post | null> => {
  try {
    await ensureServerModules();
    const contentDir = await getContentDir();

    const filePath = join(contentDir, slug, 'index.md');
    const content = await readFile(filePath, 'utf-8');
    const processed = await markdownProcessor.process(content, filePath);

    const post = {
      title: processed.frontmatter.title ?? slug,
      date: processed.frontmatter.date ?? new Date().toISOString().split('T')[0],
      excerpt: processed.excerpt ?? (processed.frontmatter['excerpt'] as string) ?? '',
      slug,
      path: slug + '/index.md',
      html: processed.html,
      image: processed.frontmatter['image'] as string | undefined,
    } as Post;

    return post;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
};

const buildContentCache = async (): Promise<void> => {
  await ensureServerModules();
  const contentDir = await getContentDir();

  const files = await findMarkdownFiles(contentDir);

  const contentEntries = await Promise.all(
    files.map(async (file) => {
      const post = await processMarkdownFile(file, contentDir, true);
      return [post.slug, post] as const;
    }),
  );

  postsContentCache = Object.fromEntries(contentEntries);
};

export const getPreviousAndNextPosts = async (
  currentSlug: string,
): Promise<{
  previous: PostMeta | null;
  next: PostMeta | null;
}> => {
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  // Previous post is the next one in chronological order (newer)
  // Next post is the previous one in chronological order (older)
  // Since posts are sorted by date desc (newest first)
  const previous = currentIndex > 0 ? (allPosts[currentIndex - 1] ?? null) : null;
  const next = currentIndex < allPosts.length - 1 ? (allPosts[currentIndex + 1] ?? null) : null;

  return { previous, next };
};

export const getPostsByPage = async (
  page: number,
  perPage: number = 10,
): Promise<{
  posts: PostMeta[];
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}> => {
  const allPosts = await getAllPosts();
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

// Clear cache for development (when files change)
export const clearCache = (): void => {
  postsCache = null;
  postsContentCache = null;
};
