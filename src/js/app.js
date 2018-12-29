import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-vim';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-markdown';
import Clipboard from 'clipboard';
import quicklink from 'quicklink';
import { $, $$ } from './utils/selectors';
import { addEvent, removeEvent } from './utils/events';

quicklink();

// Service Worker
if ('serviceWorker' in navigator) {
  addEvent(
    window,
    'load',
    async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.debug('SW registered: ', registration); // eslint-disable-line no-console
      } catch (e) {
        console.debug('SW registration failed: ', e); // eslint-disable-line no-console
      }
    },
    { capture: false },
  );
}

// Disable auto highlight
removeEvent(document, 'DOMContentLoaded', Prism.highlightAll, { capture: false });

// Initialize app
addEvent(
  document,
  'DOMContentLoaded',
  () => {
    // Code block
    const $codeBlocks = $$('pre code');

    const initializeCodeBlock = ($el, index) => {
      const id = `highlight-${index}`;
      const $pre = $el.parentNode;
      const filename = $el.className.match(/language-.+:(.+)/);

      $pre.id = id;

      // filename
      if (filename) {
        $el.className = $el.className.replace(/(language-.+)(:.+)/, '$1'); // eslint-disable-line no-param-reassign
        $pre.insertAdjacentHTML('afterbegin', `<span class="highlight-filename">${filename[1]}</span>`);
      }

      // btn copy
      $pre.insertAdjacentHTML(
        'afterbegin',
        `<button class="highlight-copy" type="button" aria-label="ソースコードをクリップボードへコピー" data-clipboard-target="#${id}"><span class="highlight-copy__msg"></span></button>`,
      );

      Prism.highlightElement($el);
    };

    if ($codeBlocks) {
      Array.prototype.slice.call($codeBlocks).forEach(initializeCodeBlock);
    }

    // Copy code
    const clipboard = new Clipboard('.highlight-copy', {
      target(trigger) {
        const $pre = $(trigger.getAttribute('data-clipboard-target'));
        const $code = $('code', $pre);
        return $code;
      },
    });

    const clipboardMsg = (trigger, msg, timeout = 1200) => {
      const $msg = $('.highlight-copy__msg', trigger);
      $msg.textContent = msg;
      $msg.classList.add('is-active');
      trigger.classList.add('is-active');
      setTimeout(() => {
        $msg.classList.remove('is-active');
        trigger.classList.remove('is-active');
      }, timeout);
    };

    clipboard.on('success', (e) => {
      clipboardMsg(e.trigger, 'Copied!!');
      e.clearSelection();
    });

    clipboard.on('error', (e) => {
      clipboardMsg(e.trigger, 'Error...');
    });

    // Logo
    const HEADER_LOGO_DURATION = 830;
    const $headerLogo = $('.header__logo');
    let headerLogoTimer = false;

    addEvent(
      $headerLogo,
      'mouseenter, touchstart',
      () => {
        if (headerLogoTimer !== false) return;

        $headerLogo.classList.add('is-hover');

        clearInterval(headerLogoTimer);

        headerLogoTimer = setTimeout(() => {
          $headerLogo.classList.remove('is-hover');
          headerLogoTimer = false;
        }, HEADER_LOGO_DURATION);
      },
      {
        capture: false,
        passive: true,
      },
    );
  },
  {
    capture: false,
  },
);
