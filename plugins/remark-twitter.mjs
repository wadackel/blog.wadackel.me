import { visit } from 'unist-util-visit';

const MOMENT_REG = /https:\/\/(:?twitter|x).com\/i\/moments\/[0-9]+/i;
const TWEET_REG = /https:\/\/(:?twitter|x)\.com\/[A-Za-z0-9-_]*\/status\/[0-9]+/i;

const flattenEms = (children) =>
  children.reduce(
    (flat, c) =>
      c.type === 'text'
        ? flat + c.value
        : c.type === 'emphasis' && c.children && c.children.length === 1
          ? flat + `_${c.children[0].value}_`
          : flat,
    '',
  );

const isTwitterLink = (node) => {
  return (
    node.children.length === 1 &&
    node.children[0].type === 'link' &&
    (TWEET_REG.test(node.children[0].url) || MOMENT_REG.test(node.children[0].url)) &&
    node.children[0].children.length >= 1 &&
    flattenEms(node.children[0].children) === node.children[0].url
  );
};

const fetchData = async (url) => {
  const target = [
    `https://publish.twitter.com/oembed?url=${url}`,
    `hide_thread=1`,
    `align=center`,
    `hide_media=0`,
    `omit_script=true`,
    `dnt=true`,
    `limit=20`,
    `chrome=nofooter`,
  ].join('&');

  const response = await fetch(target);

  return await response.json();
};

export const remarkTwitterPlugin = () => {
  return async (tree) => {
    const nodes = [];
    visit(tree, 'paragraph', (node) => {
      if (isTwitterLink(node)) {
        nodes.push(node);
      }
    });

    for (const node of nodes) {
      const url = node.children[0].url;
      const data = await fetchData(url);
      if (data.html == null) {
        continue;
      }
      node.type = 'html';
      node.value = data.html;
      node.children = null;
    }
  };
};
