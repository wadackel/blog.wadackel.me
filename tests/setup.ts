// Global test setup
import { beforeEach } from 'vitest';

// Import CSS for all tests
import '../app/style.css';

beforeEach(() => {
  // Clear any existing DOM before each test
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
    document.head.querySelectorAll('style').forEach((style) => {
      if (style.textContent?.includes('test-')) {
        style.remove();
      }
    });
  }
});
