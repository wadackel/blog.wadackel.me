/** @type {import("prettier").Config} */
export default {
  arrowParens: 'always',
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-scaffdog'],
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
};
