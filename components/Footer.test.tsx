import { describe, test, expect } from 'vitest';
import { renderComponent, takeScreenshot } from '../tests/utils/hono-test-helper';
import { Footer } from './Footer';

describe('Footer Component', () => {
  test('renders footer with all elements', async () => {
    const container = renderComponent(<Footer />);

    const footer = container.querySelector('footer')!;

    expect(footer).toBeTruthy();
    expect(footer.className).toContain('text-white');

    const containerDiv = footer.querySelector('.container');
    expect(containerDiv).toBeTruthy();

    const logoContainer = footer.querySelector('.w-24.h-24');
    expect(logoContainer).toBeTruthy();
    expect(logoContainer?.className).toContain('rounded-full bg-white');

    const socialLinks = footer.querySelectorAll('ul a');
    expect(socialLinks.length).toBeGreaterThan(0);

    const currentYear = new Date().getFullYear();
    const copyright = footer.querySelector('p:last-child');
    expect(copyright?.textContent).toContain(`© ${currentYear}`);

    await takeScreenshot({ element: footer });
  });
});
