import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';

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
  children?: Node[];
  value?: string;
  position?: any;
}

const TWITTER_REG = /https:\/\/(:?twitter|x)\.com\//i;

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

const isEmbedableUrl = (node: ParagraphNode): boolean => {
  if (!node.children) return false;

  // Check for link nodes (existing logic)
  if (node.children.length === 1 && node.children[0]) {
    const linkNode = node.children[0] as LinkNode;
    if (
      linkNode.type === 'link' &&
      !TWITTER_REG.test(linkNode.url) &&
      (linkNode.url.startsWith('http://') || linkNode.url.startsWith('https://')) &&
      linkNode.children &&
      linkNode.children.length >= 1 &&
      flattenEms(linkNode.children) === linkNode.url
    ) {
      return true;
    }
  }

  // Check for text nodes containing standalone URLs (new logic)
  if (node.children.length === 1 && node.children[0] && node.children[0].type === 'text') {
    const textValue = (node.children[0] as TextNode).value.trim();

    // Check if the text is a standalone URL
    if (
      (textValue.startsWith('http://') || textValue.startsWith('https://')) &&
      !TWITTER_REG.test(textValue) &&
      !textValue.includes(' ') && // Ensure it's a single URL, not part of larger text
      !textValue.includes('\n')
    ) {
      // Ensure it's not multiline
      return true;
    }
  }

  return false;
};

const createIframeHtml = (url: string): string => {
  const encodedUrl = encodeURIComponent(url);

  // Extract domain name from URL
  let domain: string;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = 'external site';
  }

  return `<div class="url-embed">
  <iframe 
    src="https://embed.wadackel.me?url=${encodedUrl}"
    width="100%"
    height="120"
    loading="lazy"
    title="External content from ${domain}"
    style="border: none;"
  ></iframe>
</div>`;
};

export const remarkUrlEmbedPlugin = () => {
  return (tree: Node): void => {
    const nodes: ParagraphNode[] = [];
    visit(tree, 'paragraph', (node: ParagraphNode, _index, parent: Parent | undefined) => {
      // Skip URLs that are inside blockquotes
      if (parent && parent.type === 'blockquote') {
        return;
      }

      if (isEmbedableUrl(node)) {
        nodes.push(node);
      }
    });

    for (const node of nodes) {
      let url: string | undefined;

      if (!node.children) continue;

      // Extract URL based on node type
      const childNode = node.children[0];
      if (childNode) {
        if (childNode.type === 'link') {
          url = (childNode as LinkNode).url;
        } else if (childNode.type === 'text') {
          url = (childNode as TextNode).value.trim();
        }
      }

      if (url) {
        const html = createIframeHtml(url);

        // Convert paragraph node to HTML node
        node.type = 'html';
        node.value = html;
        delete node.children;
        delete node.position; // Remove position info that might interfere
      }
    }
  };
};
