const visit = require('unist-util-visit');

module.exports = ({ markdownAST }) => {
  visit(markdownAST, 'image', (node) => {
    node.type = 'html';
    node.value = `<img src="${node.url}" alt="${node.alt}" loading="lazy" />`;
  });

  return markdownAST;
};
