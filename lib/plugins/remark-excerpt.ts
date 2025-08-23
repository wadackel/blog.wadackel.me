import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import split from 'graphemesplit';
import type { Node } from 'unist';

interface FileData {
  data: {
    astro: {
      frontmatter: {
        excerpt: string;
      };
    };
  };
}

const LENGTH = 100;

export const remarkExcerptPlugin = () => {
  return (tree: Node, file: FileData): void => {
    const paragraph: string[] = [];

    visit(tree, 'paragraph', (node: Node, index?: number) => {
      if (typeof index === 'number' && index < 3) {
        paragraph.push(toString(node));
      }
    });

    const text = paragraph.join(' ');
    const chars = split(text);

    file.data.astro.frontmatter.excerpt =
      chars.length > LENGTH ? `${chars.slice(0, LENGTH).join('')}…` : chars.join('');
  };
};
