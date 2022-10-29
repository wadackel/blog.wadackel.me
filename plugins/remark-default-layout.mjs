import path from 'path';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const layout = path.resolve(dirname, '../src/layouts');

export const remarkDefaultLayoutPlugin = () => {
  return (_tree, file) => {
    const filepath = file.history[0];
    const dir = path.dirname(filepath);
    file.data.astro.frontmatter.layout = `${path.relative(dir, layout)}/PostLayout.astro`;
  };
};
