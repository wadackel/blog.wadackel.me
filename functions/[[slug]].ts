export const onRequest: PagesFunction = async ({ params }) => {
  const slug = ['', ...params.slug].join('/');

  return new Response(`Hello, ${slug}!`);
};
