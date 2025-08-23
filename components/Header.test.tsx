import { describe, test, expect } from 'vitest';
import { renderComponent, takeScreenshot } from '../tests/utils/hono-test-helper';
import { Header } from './Header';

describe('Header Component', () => {
  test('renders header with default props (not home)', async () => {
    const container = renderComponent(<Header home={false} />);

    const header = container.querySelector('header')!;

    expect(header).toBeTruthy();
    expect(header.className).toContain('py-32');

    const containerDiv = header.querySelector('.container');
    expect(containerDiv).toBeTruthy();
    expect(containerDiv?.className).toContain('text-center');

    const h1Element = header.querySelector('h1');
    const divElement = header.querySelector('div > div');
    expect(h1Element).toBeFalsy();
    expect(divElement).toBeTruthy();

    await takeScreenshot({ element: header });
  });

  test('renders header with home prop (h1)', async () => {
    const container = renderComponent(<Header home={true} />);

    const header = container.querySelector('header')!;

    const h1Element = header.querySelector('h1');
    expect(h1Element).toBeTruthy();

    await takeScreenshot({ element: header });
  });

  test('header comparison - home vs non-home', async () => {
    const container = renderComponent(
      <div data-testid="header-comparison">
        <h3 style={{ marginBottom: '1rem', color: '#666' }}>Non-Home Header</h3>
        <Header home={false} />

        <div
          style={{
            height: '2rem',
            borderTop: '1px solid #ccc',
            margin: '2rem 0',
            paddingTop: '2rem',
          }}
        />

        <h3 style={{ marginBottom: '1rem', color: '#666' }}>Home Header</h3>
        <Header home={true} />
      </div>,
    );

    const headers = container.querySelectorAll('header');
    expect(headers).toHaveLength(2);

    const comparisonDiv = container.querySelector('[data-testid="header-comparison"]')!;
    await takeScreenshot({ element: comparisonDiv });
  });

  test('header accessibility check', async () => {
    const container = renderComponent(<Header home={true} />);

    const header = container.querySelector('header')!;

    expect(header.tagName.toLowerCase()).toBe('header');

    const h1 = header.querySelector('h1');
    expect(h1).toBeTruthy();

    const logoLink = header.querySelector('a');
    expect(logoLink).toBeTruthy();
    expect(logoLink?.href).toContain('/');

    await takeScreenshot({ element: header });
  });
});
