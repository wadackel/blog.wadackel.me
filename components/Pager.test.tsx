import { describe, test, expect } from 'vitest';
import { renderComponent, takeScreenshot } from '../tests/utils/hono-test-helper';
import { Pager } from './Pager';
import type { PostMeta } from '../lib/types';

describe('Pager Component', () => {
  const mockPreviousPost: PostMeta = {
    title: 'Previous Post Title',
    date: '2025-01-20',
    slug: '2025/previous-post',
    excerpt: 'This is a previous post excerpt.',
  };

  const mockNextPost: PostMeta = {
    title: 'Next Post Title',
    date: '2025-01-18',
    slug: '2025/next-post',
    excerpt: 'This is a next post excerpt.',
  };

  test('renders pager with both previous and next links', async () => {
    const container = renderComponent(<Pager previous={mockPreviousPost} next={mockNextPost} />);

    const nav = container.querySelector('nav')!;
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('前後記事のナビゲーション');

    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(2);

    // Previous link (newer post)
    const prevLink = links[0]!;
    expect(prevLink.href).toContain('/2025/previous-post');
    expect(prevLink.className).toContain('text-right');

    const prevLabel = prevLink.querySelector('span:first-child');
    expect(prevLabel?.textContent).toBe('Newer Post');

    const prevTitle = prevLink.querySelector('span:last-child');
    expect(prevTitle?.textContent).toBe('Previous Post Title');

    // Next link (older post)
    const nextLink = links[1]!;
    expect(nextLink.href).toContain('/2025/next-post');
    expect(nextLink.className).toContain('text-left');
    expect(nextLink.className).toContain('border-l');

    const nextLabel = nextLink.querySelector('span:first-child');
    expect(nextLabel?.textContent).toBe('Older Post');

    const nextTitle = nextLink.querySelector('span:last-child');
    expect(nextTitle?.textContent).toBe('Next Post Title');

    await takeScreenshot({ element: nav });
  });

  test('renders pager with previous link only', async () => {
    const container = renderComponent(<Pager previous={mockPreviousPost} next={null} />);

    const nav = container.querySelector('nav')!;

    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(1);

    // Previous link should exist
    const prevLink = links[0]!;
    expect(prevLink.href).toContain('/2025/previous-post');

    // Next side should have empty span
    const nextSpan = nav.querySelector('span.border-l');
    expect(nextSpan).toBeTruthy();

    await takeScreenshot({ element: nav });
  });

  test('renders pager with next link only', async () => {
    const container = renderComponent(<Pager previous={null} next={mockNextPost} />);

    const nav = container.querySelector('nav')!;

    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(1);

    // Next link should exist
    const nextLink = links[0]!;
    expect(nextLink.href).toContain('/2025/next-post');
    expect(nextLink.className).toContain('border-l');

    // Previous side should have empty span (without border)
    const prevSpans = nav.querySelectorAll('span');
    const prevSpan = Array.from(prevSpans).find((span) => !span.className.includes('border-l'));
    expect(prevSpan).toBeTruthy();

    await takeScreenshot({ element: nav });
  });

  test('renders pager with long titles using line-clamp', async () => {
    const longPreviousPost: PostMeta = {
      title:
        'This is a very long previous post title that should be clamped to two lines maximum for better UI appearance and readability',
      date: '2025-01-20',
      slug: '2025/long-previous-post',
      excerpt: 'Long previous post excerpt.',
    };

    const longNextPost: PostMeta = {
      title:
        'This is another extremely long next post title that should also be clamped to two lines maximum to maintain consistent layout',
      date: '2025-01-18',
      slug: '2025/long-next-post',
      excerpt: 'Long next post excerpt.',
    };

    const container = renderComponent(<Pager previous={longPreviousPost} next={longNextPost} />);

    const nav = container.querySelector('nav')!;

    const titleSpans = nav.querySelectorAll('span.line-clamp-2');
    expect(titleSpans).toHaveLength(2);

    // Verify line-clamp class is applied
    titleSpans.forEach((span) => {
      expect(span.className).toContain('line-clamp-2');
    });

    await takeScreenshot({ element: nav });
  });

  test('pager accessibility and structure', async () => {
    const container = renderComponent(<Pager previous={mockPreviousPost} next={mockNextPost} />);

    const nav = container.querySelector('nav')!;

    // Check semantic structure
    expect(nav.tagName.toLowerCase()).toBe('nav');
    expect(nav.getAttribute('aria-label')).toBe('前後記事のナビゲーション');

    // Check grid layout classes
    expect(nav.className).toContain('grid');
    expect(nav.className).toContain('grid-cols-2');
    expect(nav.className).toContain('border-t');

    // Check hover states are defined
    const links = nav.querySelectorAll('a');
    links.forEach((link) => {
      expect(link.className).toContain('group');
      expect(link.className).toContain('transition');
      expect(link.className).toContain('hover:bg-secondary-500');
    });

    await takeScreenshot({ element: nav });
  });
});
