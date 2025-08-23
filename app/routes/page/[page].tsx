import { createRoute } from 'honox/factory';
import { ssgParams } from 'hono/ssg';
import { getPostsByPage, getAllPosts } from '../../../lib/posts';
import { Pagination } from '../../../components/Pagination';
import { Article } from '../../../components/Article';
import { site } from '../../../lib/config';
import type { HonoContext } from '../../global';

const handler = async (c: HonoContext) => {
  const pageStr = c.req.param('page');
  const page = Number.parseInt(pageStr || '1', 10);

  if (Number.isNaN(page) || page < 1) {
    return c.notFound();
  }

  const { posts, hasNext, hasPrev, currentPage, totalPages } = await getPostsByPage(page, 10);

  if (posts.length === 0) {
    return c.notFound();
  }

  // Set meta data for the renderer
  c.set('title', `Page ${currentPage} - ${site.title}`);
  c.set('description', site.description);

  return c.render(
    <div class="container">
      {posts.map((post, index) => (
        <>
          {index > 0 && <div class="mt-32" />}
          <Article
            key={post.slug}
            single={false}
            url={`/${post.slug}`}
            date={String(post.date)}
            title={String(post.title)}
            excerpt={post.excerpt}
          />
        </>
      ))}

      <div class="my-32">
        <Pagination
          page={currentPage}
          total={totalPages}
          previous={hasPrev ? (currentPage === 2 ? '/' : `/page/${currentPage - 1}`) : null}
          next={hasNext ? `/page/${currentPage + 1}` : null}
        />
      </div>
    </div>,
  );
};

// Use ssgParams only during build (SSG), normal dynamic routing during development
const isSSGBuild = import.meta.env.PROD;

export default isSSGBuild
  ? createRoute(
      ssgParams(async () => {
        const posts = await getAllPosts();
        const totalPages = Math.ceil(posts.length / 10);
        const pages = [];

        // Generate pages 2 and onwards (page 1 is handled by index.tsx)
        for (let i = 2; i <= totalPages; i++) {
          pages.push({ page: i.toString() });
        }

        return pages;
      }),
      handler,
    )
  : createRoute(handler);
