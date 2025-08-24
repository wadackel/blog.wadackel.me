import { visit } from 'unist-util-visit';
import type { Node } from 'unist';

interface TextNode extends Node {
  type: 'text';
  value: string;
}

interface LinkNode extends Node {
  type: 'link';
  url: string;
  children: Node[];
}

interface EmphasisNode extends Node {
  type: 'emphasis';
  children: TextNode[];
}

interface ParagraphNode extends Node {
  type: 'paragraph' | 'html';
  children: LinkNode[] | null;
  value?: string;
}

interface TwitterOEmbedResponse {
  html?: string;
}

const MOMENT_REG = /https:\/\/(:?twitter|x).com\/i\/moments\/[0-9]+/i;
const TWEET_REG = /https:\/\/(:?twitter|x)\.com\/[A-Za-z0-9-_]*\/status\/[0-9]+/i;

const flattenEms = (children: Node[]): string =>
  children.reduce<string>(
    (flat, c) =>
      c.type === 'text'
        ? flat + (c as TextNode).value
        : c.type === 'emphasis' &&
            (c as EmphasisNode).children &&
            (c as EmphasisNode).children.length === 1
          ? flat + `_${(c as EmphasisNode).children[0]?.value ?? ''}_`
          : flat,
    '',
  );

const isTwitterLink = (node: ParagraphNode): boolean => {
  if (!node.children || node.children.length !== 1) return false;

  const linkNode = node.children[0];
  if (!linkNode || linkNode.type !== 'link') return false;

  return (
    (TWEET_REG.test(linkNode.url) || MOMENT_REG.test(linkNode.url)) &&
    linkNode.children &&
    linkNode.children.length >= 1 &&
    flattenEms(linkNode.children) === linkNode.url
  );
};

const fetchData = async (url: string): Promise<TwitterOEmbedResponse> => {
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

  return (await response.json()) as TwitterOEmbedResponse;
};

export const remarkTwitterPlugin = () => {
  return async (tree: Node): Promise<void> => {
    const nodes: ParagraphNode[] = [];
    visit(tree, 'paragraph', (node: ParagraphNode) => {
      if (isTwitterLink(node)) {
        nodes.push(node);
      }
    });

    for (const node of nodes) {
      if (!node.children || node.children.length === 0) continue;

      const linkNode = node.children[0];
      if (!linkNode || linkNode.type !== 'link') continue;

      const url = linkNode.url;
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
