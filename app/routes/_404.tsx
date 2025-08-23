import type { NotFoundHandler } from 'hono';

const handler: NotFoundHandler = (c) => {
  // Set meta data for the renderer
  c.set('title', '404 - Page not found - wadackel.me');
  c.set('description', 'Sorry this page does not exist');
  c.set('type', '404');

  return c.render(
    <div class="container pb-32">
      <div class="text-center">
        <h1 class="text-[1.625rem] md:text-[1.875rem] leading-normal font-normal">
          404 - Page not found
        </h1>
        <p class="mt-4 text-xs md:text-sm">Sorry this page does not exist</p>
      </div>

      <p class="mt-20 text-center">
        お探しのページは一時的にアクセスができない状況にあるか、削除・変更された可能性があります。
      </p>

      <p class="mt-4 text-center">
        <a href="/" class="hover:text-primary-500 transition-colors duration-200">
          トップページへ戻る
        </a>
      </p>
    </div>,
  );
};

export default handler;
