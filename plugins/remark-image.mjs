import { visit } from 'unist-util-visit';

export const remarkImagePlugin = () => {
  return (tree) => {
    visit(tree, 'image', (node) => {
      node.type = 'html';
      node.value = `<img src="${node.url}" alt="${node.alt}" loading="lazy" />`;
    });
  };
};
