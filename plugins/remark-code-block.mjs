import Prism from 'prismjs';
import prismComponents from 'prismjs/components';
import { visit } from 'unist-util-visit';
import parseRange from 'parse-numeric-range';

// bash
// bash{1,4-6}
// bash:Example
// bash:"Code Title"
// bash{1,4-6}:Example
// bash{1,4-6}:"Code Title"
const parseMeta = (meta) => {
  const result = {
    language: '',
    title: null,
    highlight: null,
  };

  if (!meta) {
    return {
      ...result,
      language: 'text',
    };
  }

  const length = meta.length;
  let buffer = '';
  let index = 0;

  const read = () => {
    const token = buffer;
    buffer = '';
    return token;
  };

  const consumeTo = (s) => {
    while (index < length) {
      const char = meta.charAt(index);
      if (char === s) {
        break;
      } else {
        buffer += char;
      }
      index++;
    }
  };

  while (index < length) {
    const char = meta.charAt(index);

    switch (char) {
      case '{': {
        result.language = read();

        index += 1;
        consumeTo('}');
        result.highlight = parseRange(read());

        break;
      }

      case ':': {
        if (result.language === '') {
          result.language = read();
        }

        index += 1;

        if (meta.charAt(index) === '"') {
          index += 1;
          consumeTo('"');
        } else {
          consumeTo(' ');
        }

        result.title = read();

        break;
      }

      default: {
        buffer += char;
        break;
      }
    }

    index++;
  }

  if (result.language === '') {
    result.language = read();
  }

  return result;
};

const getBaseLanguageName = (nameOrAlias) => {
  if (prismComponents.languages[nameOrAlias]) {
    return nameOrAlias;
  }

  return Object.keys(prismComponents.languages).find((language) => {
    const { alias } = prismComponents.languages[language];
    if (!alias) {
      return false;
    }

    return Array.isArray(alias) ? alias.includes(nameOrAlias) : alias === nameOrAlias;
  });
};

const loadLanguage = async (language) => {
  const base = getBaseLanguageName(language);
  if (!base) {
    throw new Error(`Prism doesn't support language '${language}'.`);
  }

  if (Prism.languages[base]) {
    return;
  }

  const data = prismComponents.languages[base];
  if (data.option === 'default') {
    return;
  }

  if (data.require) {
    if (Array.isArray(data.require)) {
      await Promise.all(data.require.map((lang) => loadLanguage(lang)));
    } else {
      await loadLanguage(data.require);
    }
  }

  await import(`prismjs/components/prism-${base}.js` /* @vite-ignore */);
};

const escape = (code) => {
  const htmlEscapes = {
    '&': `&amp;`,
    '>': `&gt;`,
    '<': `&lt;`,
    '"': `&quot;`,
    "'": `&#39;`,
  };

  const escapedChars = (char) => htmlEscapes[char];

  const chars = Object.keys(htmlEscapes);

  const charsRe = new RegExp(`[${chars.join(``)}]`, `g`);

  const rehasUnescapedChars = new RegExp(charsRe.source);

  return code && rehasUnescapedChars.test(code) ? code.replace(charsRe, escapedChars) : code;
};

const highlightCode = async (language, code, highlight) => {
  let highlighted = code;

  if (language === 'text') {
    highlighted = escape(code);
  } else {
    if (!Prism.languages[language]) {
      try {
        await loadLanguage(language);
      } catch (e) {
        console.error(e);
      }
    }

    const grammar = Prism.languages[language];

    highlighted = Prism.highlight(code, grammar, language);
  }

  return highlighted
    .split('\n')
    .map((line, index) => {
      const n = index + 1;

      if (highlight?.includes(n)) {
        return `<span class="line is-highlight">${line}</span>`;
      } else {
        return `<span class="line">${line}</span>`;
      }
    })
    .join('\n');
};

export const remarkCodeBlockPlugin = () => {
  return async (tree) => {
    const codes = [];

    visit(tree, 'code', (node) => {
      const meta = node.meta ? node.lang + node.meta : node.lang;
      const { language, title, highlight } = parseMeta(meta);
      codes.push({
        language,
        title,
        highlight,
        node,
      });
    });

    await Promise.all(
      codes.map(async ({ language, title, highlight, node }, index) => {
        const code = await highlightCode(language, node.value, highlight);
        const id = `highlight-${index}`;

        node.type = 'html';
        node.value = `
<div class="highlight">
  ${title ? `<div class="highlight_title">${title}</div>` : ''}
  <pre id="${id}" class="language-${language}"><code>${code}</code></pre>
  <button
    type="button"
    class="highlight_copy"
    aria-controls="${id}"
    aria-label="ソースコードをクリップボードへコピー"
    onClick="copyHighlightCode(event)"
  >
    <span class="highlight_copy_tooltip"></span>
  </button>
</div>
    `;
      }),
    );
  };
};
