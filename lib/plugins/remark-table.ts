import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';

interface TableNode extends Node {
  type: 'table' | 'html';
  value?: string;
}

interface HtmlNode extends Node {
  type: 'html';
  value: string;
}

export const remarkTablePlugin = () => {
  return (tree: Node): void => {
    const tablesToWrap: Array<{ node: TableNode; index: number; parent: Parent }> = [];

    // First, collect all tables to wrap
    visit(tree, 'table', (node: TableNode, index, parent) => {
      if (parent && typeof index === 'number') {
        tablesToWrap.push({ node, index, parent: parent as Parent });
      }
    });

    // Then, wrap them in reverse order to avoid index shifting issues
    tablesToWrap.reverse().forEach(({ node, index, parent }) => {
      const wrapper: HtmlNode = {
        type: 'html',
        value: '<div class="table-wrapper">',
      };

      const closer: HtmlNode = {
        type: 'html',
        value: '</div>',
      };

      // Replace the table node with wrapper + table + closer
      parent.children.splice(index, 1, wrapper, node, closer);
    });
  };
};
