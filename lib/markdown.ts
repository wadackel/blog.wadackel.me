import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import split from 'graphemesplit';
import type { PostMeta } from './types';

// Custom plugins - using any type to avoid complex unified type issues
let remarkCodeBlockPlugin: any;
let remarkImagePlugin: any;
let remarkTwitterPlugin: any;
let remarkTablePlugin: any;
let remarkUrlEmbedPlugin: any;

// Frontmatter removal plugin (same approach as sample project)
const removeFrontmatter = () => {
  return (tree: any) => {
    if (tree.children && tree.children[0] && tree.children[0].type === 'yaml') {
      tree.children.shift();
    }
  };
};

export class MarkdownProcessor {
  private processor: any = null;

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
      const { default: remarkSlug } = await import('remark-slug');
      const { default: remarkAutolinkHeadings } = await import('remark-autolink-headings');
      const { default: remarkEmoji } = await import('remark-emoji');

      // Dynamic import of @fec/remark-a11y-emoji
      const remarkAnchorPkg = await import('@fec/remark-a11y-emoji');
      const remarkAnchor = remarkAnchorPkg.default?.remarkAnchor || remarkAnchorPkg.remarkAnchor;

      // Dynamic import of custom plugins
      const remarkCodeBlockModule = await import('./plugins/remark-code-block');
      remarkCodeBlockPlugin = remarkCodeBlockModule.remarkCodeBlockPlugin;

      const remarkImageModule = await import('./plugins/remark-image');
      remarkImagePlugin = remarkImageModule.remarkImagePlugin;

      const remarkUrlEmbedModule = await import('./plugins/remark-url-embed');
      remarkUrlEmbedPlugin = remarkUrlEmbedModule.remarkUrlEmbed;

      const remarkTwitterModule = await import('./plugins/remark-twitter');
      remarkTwitterPlugin = remarkTwitterModule.remarkTwitterPlugin;

      const remarkTableModule = await import('./plugins/remark-table');
      remarkTablePlugin = remarkTableModule.remarkTablePlugin;

      const processor = unified() as any;
      this.processor = processor
        .use(remarkParse)
        .use(remarkFrontmatter) // Recognize frontmatter syntax
        .use(removeFrontmatter) // Remove frontmatter
        .use(remarkGfm)
        .use(remarkUrlEmbedPlugin) // Place right after remarkGfm (same order as Astro)
        .use(remarkSlug)
        .use(remarkAutolinkHeadings, {
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

    const file = new (VFile as any)(content);
    matter(file);

    const frontmatter = (file.data.matter as Record<string, string>) || {};
    const markdownContent = file.value.toString();

    // Process Markdown with Unified processor
    const processor = await this.ensureProcessor();
    const vfile = new (VFile as any)({ value: markdownContent, path: filepath });
    const result = await processor.process(vfile);

    return {
      html: String(result),
      frontmatter: {
        title: frontmatter['title'] ?? 'Untitled',
        date: (frontmatter['date'] as string) ?? new Date().toISOString().split('T')[0],
        slug: frontmatter['slug'] ?? 'untitled',
        ...frontmatter,
      },
      excerpt: (result.data as { excerpt?: string })?.excerpt ?? '',
    };
  }

  // Excerpt extraction plugin
  private remarkExcerptPlugin = () => {
    return (tree: any, file: any) => {
      if (!file.data) {
        file.data = {};
      }

      const paragraph: string[] = [];

      visit(tree, 'paragraph', (node: any, index: any) => {
        if (typeof index === 'number' && index < 3) {
          paragraph.push(toString(node));
        }
      });

      const text = paragraph.join(' ');
      const chars = split(text);
      const LENGTH = 100;

      file.data.excerpt =
        chars.length > LENGTH ? `${chars.slice(0, LENGTH).join('')}…` : chars.join('');
    };
  };

  // Image optimization plugin
  private rehypeImageOptimizePlugin = () => {
    return (tree: any) => {
      visit(tree, 'element', (node: any) => {
        if (node.tagName === 'img') {
          // Add loading="lazy"
          node.properties.loading = 'lazy';

          // Add decoding="async" (asynchronous image decoding)
          node.properties.decoding = 'async';
        }
      });
    };
  };
}
