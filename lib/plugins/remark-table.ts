import { unified } from 'unified';
import remark2rehype from 'remark-rehype';
import { visit } from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';
import type { Node } from 'unist';

interface TableNode extends Node {
  type: 'table' | 'html';
  value?: string;
}

export const remarkTablePlugin = () => {
  return (tree: Node): void => {
    visit(tree, 'table', (node: TableNode) => {
      // Use the same approach as the original JavaScript version
      const html = toHtml(
        unified()
          .use(remark2rehype)
          .runSync(node as any) as any,
      );

      node.type = 'html';
      node.value = `
        <div class="table-wrapper">
          ${html}
        </div>
      `;
    });
  };
};
