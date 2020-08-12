const unified = require('unified');
const remark2rehype = require('remark-rehype');
const toHtml = require('hast-util-to-html');
const visit = require('unist-util-visit');

module.exports = ({ markdownAST }) => {
  visit(markdownAST, 'table', (node) => {
    const html = toHtml(unified().use(remark2rehype).runSync(node));

    node.type = 'html';
    node.value = `
      <div class="table-wrapper">
        ${html}
      </div>
    `;
  });

  return markdownAST;
};
