import { visit } from 'unist-util-visit';
import path from 'path';
import type { Node } from 'unist';

interface ImageNode extends Node {
  type: 'image';
  url: string;
  alt?: string;
  title?: string;
}

interface FileData {
  path?: string;
  basename?: string;
}

export const remarkImagePlugin = () => {
  return (tree: Node, file: FileData): void => {
    visit(tree, 'image', (node: ImageNode) => {
      let imageUrl = node.url;

      // For relative paths, convert to absolute path based on article directory
      // Handle relative paths: "./file", "../file", or just "file" (no leading slash)
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        // Get directory from file path
        // file.path is in format like content/2025/original-keyboard/index.md
        const filePath = file.path || file.basename || '';
        const contentDirMatch = filePath.match(/content\/(.+)\/index\.md$/);

        if (contentDirMatch != null && contentDirMatch[1]) {
          const articleDir = contentDirMatch[1]; // "2025/original-keyboard"
          // Resolve relative path to absolute path
          const resolvedPath = path.posix.resolve('/', articleDir, imageUrl);
          imageUrl = resolvedPath;
        }
      }

      // Just update the image node URL without converting to HTML node
      node.url = imageUrl;
    });
  };
};
