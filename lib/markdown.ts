import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import split from 'graphemesplit';
import type { PostMeta } from './types';
import type { Root as MdastRoot, Paragraph } from 'mdast';
import type { Root as HastRoot, Element } from 'hast';
import type { VFile } from 'vfile';
import type { Processor } from 'unified';

// Frontmatter removal plugin (same approach as sample project)
const removeFrontmatter = () => {
  return (tree: MdastRoot) => {
    if (tree.children.length > 0) {
      const firstChild = tree.children[0];
      if (firstChild && 'type' in firstChild && firstChild.type === 'yaml') {
        tree.children.shift();
      }
    }
  };
};

export class MarkdownProcessor {
  private processor: Processor<any, any, any, any, any> | null = null;

  async ensureProcessor() {
    if (this.processor) return this.processor;

    try {
      // Load Unified ecosystem via dynamic import (same approach as sample project)
      const { unified } = await import('unified');
      const { default: remarkParse } = await import('remark-parse');
      const { default: remarkFrontmatter } = await import('remark-frontmatter');
      const { default: remarkGfm } = await import('remark-gfm');
      const { default: remarkRehype } = await import('remark-rehype');
      const { default: rehypeStringify } = await import('rehype-stringify');
      const { default: rehypeSlug } = await import('rehype-slug');
      const { default: rehypeAutolinkHeadings } = await import('rehype-autolink-headings');
      const { default: remarkEmoji } = await import('remark-emoji');

      // Dynamic import of @fec/remark-a11y-emoji
      const remarkAnchorPkg = await import('@fec/remark-a11y-emoji');
      const remarkAnchor = remarkAnchorPkg.default.remarkAnchor;

      // Dynamic import of custom plugins
      const { remarkCodeBlockPlugin } = await import('./plugins/remark-code-block');
      const { remarkImagePlugin } = await import('./plugins/remark-image');
      const { remarkUrlEmbedPlugin } = await import('./plugins/remark-url-embed');
      const { remarkTwitterPlugin } = await import('./plugins/remark-twitter');
      const { remarkTablePlugin } = await import('./plugins/remark-table');

      // Initialize unified processor with proper type handling
      // The processor chain involves complex type transformations (mdast -> hast)
      // that require careful handling to maintain type safety while avoiding overly complex generics
      this.processor = unified()
        .use(remarkParse)
        .use(remarkFrontmatter) // Recognize frontmatter syntax
        .use(removeFrontmatter) // Remove frontmatter
        .use(remarkGfm)
        .use(remarkUrlEmbedPlugin) // Place right after remarkGfm (same order as Astro)
        .use(remarkEmoji)
        .use(remarkAnchor)
        // Custom plugins
        .use(remarkCodeBlockPlugin)
        .use(this.remarkExcerptPlugin)
        .use(remarkImagePlugin)
        .use(remarkTwitterPlugin)
        .use(remarkTablePlugin)
        .use(remarkRehype, {
          allowDangerousHtml: true,
          footnoteLabel: ' ',
          footnoteLabelTagName: 'hr',
        })
        // Move slug and rehype-slug to rehype (after remark-to-rehype conversion)
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, {
          behavior: 'append',
          content: {
            type: 'element',
            tagName: 'span',
            properties: {
              className: ['heading-anchor'],
              ariaLabel: 'Link to heading',
            },
            children: [{ type: 'text', value: '#' }],
          },
        })
        .use(this.rehypeImageOptimizePlugin)
        .use(rehypeStringify, { allowDangerousHtml: true });

      return this.processor;
    } catch (error) {
      console.error('Failed to initialize unified processor:', error);
      throw error;
    }
  }

  async process(
    content: string,
    filepath: string,
  ): Promise<{
    html: string;
    frontmatter: Pick<PostMeta, 'title' | 'date' | 'slug'> & Record<string, unknown>;
    excerpt?: string;
  }> {
    // Frontmatter processing with vfile-matter
    const { matter } = await import('vfile-matter');
    const { VFile } = await import('vfile');

    const file = new VFile(content);
    matter(file);

    const frontmatter = (file.data?.['matter'] as Record<string, string>) || {};
    const markdownContent = String(file.value);

    // Process Markdown with Unified processor
    const processor = await this.ensureProcessor();
    const vfile = new VFile({ value: markdownContent, path: filepath });
    const result = await processor.process(vfile);

    return {
      html: String(result),
      frontmatter: {
        title: frontmatter['title'] ?? 'Untitled',
        date: (frontmatter['date'] as string) ?? new Date().toISOString().split('T')[0],
        slug: frontmatter['slug'] ?? 'untitled',
        ...frontmatter,
      },
      excerpt:
        (result.data && 'excerpt' in result.data ? String(result.data['excerpt']) : '') ?? '',
    };
  }

  // Excerpt extraction plugin
  private remarkExcerptPlugin = () => {
    return (tree: MdastRoot, file: VFile) => {
      if (!file.data) {
        file.data = {};
      }

      const paragraph: string[] = [];

      visit(tree, 'paragraph', (node: Paragraph, index?: number) => {
        if (typeof index === 'number' && index < 3) {
          paragraph.push(toString(node));
        }
      });

      const text = paragraph.join(' ');
      const chars = split(text);
      const LENGTH = 100;

      file.data['excerpt'] =
        chars.length > LENGTH ? `${chars.slice(0, LENGTH).join('')}…` : chars.join('');
    };
  };

  // Image optimization plugin
  private rehypeImageOptimizePlugin = () => {
    return (tree: HastRoot) => {
      visit(tree, 'element', (node: Element) => {
        if ('tagName' in node && node.tagName === 'img') {
          // Add loading="lazy"
          if ('properties' in node && node.properties && typeof node.properties === 'object') {
            const props = node.properties as Record<string, unknown>;
            props['loading'] = 'lazy';
            // Add decoding="async" (asynchronous image decoding)
            props['decoding'] = 'async';
          }
        }
      });
    };
  };
}
