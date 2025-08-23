import path from 'path';
import type { Node } from 'unist';

interface FileData {
  history: string[];
  data: {
    astro: {
      frontmatter: {
        layout: string;
      };
    };
  };
}

const dirname = path.dirname(new URL(import.meta.url).pathname);
const layout = path.resolve(dirname, '../src/layouts');

export const remarkDefaultLayoutPlugin = () => {
  return (_tree: Node, file: FileData): void => {
    const filepath = file.history[0];
    if (filepath == null) {
      return;
    }
    const dir = path.dirname(filepath);
    file.data.astro.frontmatter.layout = `${path.relative(dir, layout)}/PostLayout.astro`;
  };
};
