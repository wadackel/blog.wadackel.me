import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import split from 'graphemesplit';

const LENGTH = 100;

export const remarkExcerptPlugin = () => {
  return (tree, file) => {
    const paragraph = [];

    visit(tree, 'paragraph', (node, index) => {
      if (index < 3) {
        paragraph.push(toString(node));
      }
    });

    const text = paragraph.join(' ');
    const chars = split(text);

    file.data.astro.frontmatter.excerpt =
      chars.length > LENGTH ? `${chars.slice(0, LENGTH).join('')}…` : chars.join('');
  };
};
