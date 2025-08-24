import { visit } from 'unist-util-visit';
import type { Node } from 'unist';

interface TableNode extends Node {
  type: 'table' | 'html';
  value?: string;
}

export const remarkTablePlugin = () => {
  return (tree: Node): void => {
    visit(tree, 'table', (node: TableNode) => {
      // Convert the table to a wrapped HTML node
      // The main remark-rehype pipeline will handle table conversion,
      // so this plugin just marks tables for wrapper div treatment
      node.type = 'html';
      node.value = '<div class="table-wrapper"><!-- Table processed by main pipeline --></div>';
    });
  };
};
