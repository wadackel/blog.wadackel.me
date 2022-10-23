import { unified } from 'unified';
import remark2rehype from 'remark-rehype';
import { visit } from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';

export const remarkTablePlugin = () => {
  return (tree) => {
    visit(tree, 'table', (node) => {
      const html = toHtml(unified().use(remark2rehype).runSync(node));

      node.type = 'html';
      node.value = `
        <div class="table-wrapper">
          ${html}
        </div>
      `;
    });
  };
};
