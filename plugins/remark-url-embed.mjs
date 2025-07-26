import { visit } from 'unist-util-visit';

const TWITTER_REG = /https:\/\/(:?twitter|x)\.com\//i;

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

const isEmbedableUrl = (node) => {
  return (
    node.children.length === 1 &&
    node.children[0].type === 'link' &&
    !TWITTER_REG.test(node.children[0].url) &&
    (node.children[0].url.startsWith('http://') || node.children[0].url.startsWith('https://')) &&
    node.children[0].children.length >= 1 &&
    flattenEms(node.children[0].children) === node.children[0].url
  );
};

const createIframeHtml = (url) => {
  const encodedUrl = encodeURIComponent(url);

  // URLからドメイン名を抽出
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = 'external site';
  }

  return `<div class="url-embed">
  <iframe 
    src="https://embed.wadackel.me?url=${encodedUrl}"
    width="100%"
    height="122"
    loading="lazy"
    title="External content from ${domain}"
    style="border: none;"
  ></iframe>
</div>`;
};

export const remarkUrlEmbed = () => {
  return (tree) => {
    const nodes = [];
    visit(tree, 'paragraph', (node) => {
      if (isEmbedableUrl(node)) {
        nodes.push(node);
      }
    });

    for (const node of nodes) {
      const url = node.children[0].url;
      const html = createIframeHtml(url);

      node.type = 'html';
      node.value = html;
      node.children = null;
    }
  };
};
