import { renderToString } from 'hono/jsx/dom/server';
import { page } from '@vitest/browser/context';
import type { JSXNode } from 'hono/jsx';
import { MarkdownProcessor } from '../../lib/markdown';

// CSS is imported in tests/setup.ts - Tailwind CSS v4 handles everything automatically

let markdownProcessor: MarkdownProcessor | null = null;

/**
 * Get or create a shared markdown processor instance
 */
const getMarkdownProcessor = (): MarkdownProcessor => {
  if (!markdownProcessor) {
    markdownProcessor = new MarkdownProcessor();
  }
  return markdownProcessor;
};

/**
 * Create a styled container for component testing with proper setup
 */
export const createTestContainer = (id = 'test-container') => {
  document.body.innerHTML = '';

  const container = document.createElement('div');
  container.id = id;
  container.style.padding = '20px';
  document.body.appendChild(container);

  return container;
};

/**
 * Render a Hono JSX component to the DOM using server-side rendering
 */
export const renderComponent = (component: JSXNode | any): HTMLElement => {
  const container = createTestContainer();

  try {
    // Use Hono's server-side rendering to generate HTML
    const html = renderToString(component);
    container.innerHTML = html;

    return container;
  } catch (error) {
    console.error('Failed to render component:', error);
    console.error('Component:', component);
    throw error;
  }
};

/**
 * Process markdown text and return HTML content
 */
export const processMarkdown = async (markdown: string): Promise<string> => {
  const processor = getMarkdownProcessor();
  const result = await processor.process(markdown, 'test.md');
  return result.html;
};

/**
 * Render a component with markdown content processed through the full pipeline
 */
export const renderComponentWithMarkdown = async (
  component: (content: string) => JSXNode | any,
  markdown: string,
): Promise<HTMLElement> => {
  const html = await processMarkdown(markdown);
  return renderComponent(component(html));
};

/**
 * Take a screenshot of the current page or element
 * Uses screenshotDirectory configuration from vitest.config.ts
 */
export const takeScreenshot = async (options?: { element?: Element }) => {
  const { element } = options || {};

  // Wait for CSS to load and rendering to complete
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    if (element) {
      const rect = element.getBoundingClientRect();

      // Adjust viewport to fit the element with some margin
      await page.viewport(Math.ceil(rect.width + 40), Math.ceil(rect.height + 40));

      // Use Vitest's built-in element option for type-safe screenshot
      await page.screenshot({ element });
    } else {
      // Take viewport screenshot
      await page.screenshot();
    }
  } catch (error) {
    const elementInfo = element
      ? `element: ${element.tagName.toLowerCase()}${element.className ? '.' + element.className.split(' ').join('.') : ''}`
      : 'viewport';
    console.error(`❌ Screenshot failed for ${elementInfo}:`, error);
    throw error;
  }
};
