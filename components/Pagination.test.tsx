import { describe, test, expect } from 'vitest';
import { renderComponent, takeScreenshot } from '../tests/utils/hono-test-helper';
import { Pagination } from './Pagination';

describe('Pagination Component', () => {
  test('renders pagination with both previous and next', async () => {
    const container = renderComponent(
      <Pagination page={3} total={5} previous="/page/2" next="/page/4" />,
    );

    const nav = container.querySelector('nav')!;

    const links = nav.querySelectorAll('a');
    const pageInfo = nav.querySelector('span');

    expect(links).toHaveLength(2);
    expect(pageInfo?.textContent).toBe('Page 3 of 5');

    const prevLink = links[0]!;
    expect(prevLink.href).toContain('/page/2');
    expect(prevLink.getAttribute('aria-label')).toBe('新しい記事へ遷移');
    expect(prevLink.getAttribute('aria-disabled')).toBe('false');

    const nextLink = links[1]!;
    expect(nextLink.href).toContain('/page/4');
    expect(nextLink.getAttribute('aria-label')).toBe('古い記事へ遷移');
    expect(nextLink.getAttribute('aria-disabled')).toBe('false');

    await takeScreenshot({ element: nav });
  });

  test('renders pagination on first page (no previous)', async () => {
    const container = renderComponent(
      <Pagination page={1} total={10} previous={null} next="/page/2" />,
    );

    const nav = container.querySelector('nav')!;
    const links = nav.querySelectorAll('a');
    const pageInfo = nav.querySelector('span');

    expect(pageInfo?.textContent).toBe('Page 1 of 10');

    const prevLink = links[0]!;
    expect(prevLink.hasAttribute('href')).toBe(false);
    expect(prevLink.getAttribute('aria-disabled')).toBe('true');

    const nextLink = links[1]!;
    expect(nextLink.href).toContain('/page/2');
    expect(nextLink.getAttribute('aria-disabled')).toBe('false');

    await takeScreenshot({ element: nav });
  });

  test('renders pagination on last page (no next)', async () => {
    const container = renderComponent(
      <Pagination page={5} total={5} previous="/page/4" next={null} />,
    );

    const nav = container.querySelector('nav')!;
    const links = nav.querySelectorAll('a');
    const pageInfo = nav.querySelector('span');

    expect(pageInfo?.textContent).toBe('Page 5 of 5');

    const prevLink = links[0]!;
    expect(prevLink.href).toContain('/page/4');
    expect(prevLink.getAttribute('aria-disabled')).toBe('false');

    const nextLink = links[1]!;
    expect(nextLink.hasAttribute('href')).toBe(false);
    expect(nextLink.getAttribute('aria-disabled')).toBe('true');

    await takeScreenshot({ element: nav });
  });

  test('renders pagination with single page', async () => {
    const container = renderComponent(
      <Pagination page={1} total={1} previous={null} next={null} />,
    );

    const nav = container.querySelector('nav')!;
    const links = nav.querySelectorAll('a');
    const pageInfo = nav.querySelector('span');

    expect(pageInfo?.textContent).toBe('Page 1 of 1');

    const prevLink = links[0]!;
    const nextLink = links[1]!;
    expect(prevLink.getAttribute('aria-disabled')).toBe('true');
    expect(nextLink.getAttribute('aria-disabled')).toBe('true');

    await takeScreenshot({ element: nav });
  });

  test('renders pagination with large page numbers', async () => {
    const container = renderComponent(
      <Pagination page={127} total={999} previous="/page/126" next="/page/128" />,
    );

    const nav = container.querySelector('nav')!;
    const pageInfo = nav.querySelector('span');
    expect(pageInfo?.textContent).toBe('Page 127 of 999');

    await takeScreenshot({ element: nav });
  });
});
