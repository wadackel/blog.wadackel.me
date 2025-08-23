import { createRoute } from 'honox/factory';
import { ssgParams } from 'hono/ssg';
import { getAllPosts, getPostBySlug, getPreviousAndNextPosts } from '../../../lib/posts';
import { PostContent } from '../../../components/PostContent';
import { Pager } from '../../../components/Pager';
import { CodeCopyScript } from '../../../components/CodeCopyScript';
import { Article } from '../../../components/Article';
import { TwitterWidgetsScript } from '../../../components/TwitterWidgetsScript';
import Share from '../../islands/Share';
import type { HonoContext } from '../../global';

const handler = async (c: HonoContext) => {
  const year = c.req.param('year');
  const slug = c.req.param('slug');

  // Skip image files - let them be handled by static asset middleware
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  if (slug && imageExtensions.some((ext) => slug.toLowerCase().endsWith(ext))) {
    return c.notFound();
  }

  const fullSlug = `${year}/${slug}`;

  if (!year || !slug) {
    return c.notFound();
  }

  try {
    const post = await getPostBySlug(fullSlug);

    if (!post) {
      return c.notFound();
    }

    // Get previous and next posts
    const { previous, next } = await getPreviousAndNextPosts(fullSlug);

    const currentUrl = new URL(`/${fullSlug}`, c.req.url).toString();

    // OGP settings
    const meta = {
      title: `${post.title} - wadackel.me`,
      url: currentUrl,
      image: post.image
        ? new URL(post.image, c.req.url).toString()
        : new URL(`/${fullSlug}/ogp.png`, c.req.url).toString(),
      description: post.excerpt || '',
    };

    // Set meta data for the renderer
    c.set('title', meta.title);
    c.set('description', meta.description);
    c.set('type', 'article');
    c.set('ogp', {
      title: post.title,
      description: meta.description,
      url: meta.url,
      image: meta.image,
      type: 'article',
    });

    return c.render(
      <>
        <div class="container">
          <Article
            single={true}
            url={currentUrl}
            date={String(post.date)}
            title={String(post.title)}
            excerpt={post.excerpt}
          />

          <div class="mt-20">
            <PostContent>
              <div dangerouslySetInnerHTML={{ __html: post.html }} />
            </PostContent>
          </div>

          <div class="mt-32">
            <Share title={post.title} url={currentUrl} />
          </div>
        </div>

        <div class="mt-32">
          <Pager previous={previous} next={next} />
        </div>

        <CodeCopyScript />
        <TwitterWidgetsScript html={post.html} />
      </>,
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    return c.notFound();
  }
};

// Use ssgParams only during build (SSG), normal dynamic routing during development
const isSSGBuild = import.meta.env.PROD;

export default isSSGBuild
  ? createRoute(
      ssgParams(async () => {
        const posts = await getAllPosts();
        return posts.map((post) => {
          const [year, slug] = post.slug.split('/');
          if (year == null || slug == null) {
            throw new Error(`Invalid slug format: ${post.slug}`);
          }
          return { year, slug };
        });
      }),
      handler,
    )
  : createRoute(handler);
