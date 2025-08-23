import { describe, test, expect } from 'vitest';
import { renderComponent, takeScreenshot } from '../tests/utils/hono-test-helper';
import { Article } from './Article';

describe('Article Component', () => {
  test('renders article in list mode (not single)', async () => {
    const container = renderComponent(
      <Article
        single={false}
        url="/2025/example-post"
        date="2025-01-15"
        title="Sample Blog Post Title"
        excerpt="This is a sample excerpt text that would appear on the blog listing page."
      />,
    );

    const article = container.querySelector('article')!;

    const h2 = article.querySelector('h2');
    const link = article.querySelector('a');
    const time = article.querySelector('time');
    const excerptP = article.querySelector('p.mt-6');

    expect(h2).toBeTruthy();
    expect(link).toBeTruthy();
    expect(link?.textContent).toBe('Sample Blog Post Title');
    expect(link?.href).toContain('/2025/example-post');
    expect(time).toBeTruthy();
    expect(time?.textContent).toBe('January 15, 2025');
    expect(excerptP).toBeTruthy();
    expect(excerptP?.textContent).toContain('This is a sample excerpt');

    await takeScreenshot({ element: article });
  });

  test('renders article in single mode', async () => {
    const container = renderComponent(
      <Article
        single={true}
        url="#"
        date="2024-12-25"
        title="Single Article Page Title"
        excerpt="This excerpt should not appear in single mode"
      />,
    );

    const article = container.querySelector('article')!;

    const h1 = article.querySelector('h1');
    const h2 = article.querySelector('h2');
    const excerptP = article.querySelector('p.mt-6');

    expect(h1).toBeTruthy();
    expect(h1?.textContent).toBe('Single Article Page Title');
    expect(h2).toBeFalsy();
    expect(excerptP).toBeFalsy();

    await takeScreenshot({ element: article });
  });

  test('renders article without excerpt', async () => {
    const container = renderComponent(
      <Article
        single={false}
        url="/2023/no-excerpt-post"
        title="Article Without Excerpt"
        date="2023-03-15"
        excerpt="" // Empty excerpt
      />,
    );

    const article = container.querySelector('article')!;

    const excerptP = article.querySelector('p.mt-6');
    expect(excerptP).toBeFalsy();

    await takeScreenshot({ element: article });
  });

  test('visual comparison - multiple articles in list', async () => {
    const container = renderComponent(
      <div data-testid="articles-list">
        <Article
          single={false}
          url="/2025/first-post"
          title="First Blog Post"
          date="2025-01-20"
          excerpt="This is the first blog post excerpt."
        />
        <div style={{ height: '2rem' }} />
        <Article
          single={false}
          url="/2025/second-post"
          title="Second Blog Post with Longer Title"
          date="2025-01-18"
          excerpt="This is a longer excerpt for the second blog post that demonstrates how multiple articles look when rendered together in a list format."
        />
        <div style={{ height: '2rem' }} />
        <Article
          single={false}
          url="/2025/third-post"
          title="Third Blog Post"
          date="2025-01-15"
          excerpt="Short excerpt."
        />
      </div>,
    );

    const articles = container.querySelectorAll('article');
    expect(articles).toHaveLength(3);

    const articlesList = container.querySelector('[data-testid="articles-list"]')!;
    await takeScreenshot({ element: articlesList });
  });
});
