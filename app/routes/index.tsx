import { getPostsByPage } from '../../lib/posts';
import { Pagination } from '../../components/Pagination';
import { Article } from '../../components/Article';
import { site } from '../../lib/config';
import type { HonoContext } from '../global';

export default async function HomePage(c: HonoContext) {
  // Display the latest 10 posts
  const { posts: recentPosts, hasNext, totalPages } = await getPostsByPage(1, 10);

  // Set meta data for the renderer
  c.set('title', `${site.title} - ${site.description}`);
  c.set('description', site.description);
  c.set('type', 'home');

  return c.render(
    <div class="container">
      {recentPosts.map((post, index) => (
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
        <Pagination page={1} total={totalPages} previous={null} next={hasNext ? '/page/2' : null} />
      </div>
    </div>,
  );
}
