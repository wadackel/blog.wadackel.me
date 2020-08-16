const Prism = require('prismjs');
const prismComponents = require('prismjs/components');
const visit = require('unist-util-visit');
const parseRange = require('parse-numeric-range');

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

    return Array.isArray(alias)
      ? alias.includes(nameOrAlias)
      : alias === nameOrAlias;
  });
};

const loadLanguage = (language) => {
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
      data.require.forEach(loadLanguage);
    } else {
      loadLanguage(data.require);
    }
  }

  require(`prismjs/components/prism-${base}.js`);
};

const highlightCode = (language, code, highlight) => {
  let highlighted = code;

  if (language !== 'text') {
    if (!Prism.languages[language]) {
      try {
        loadLanguage(language);
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
        return `<span class="highlight-line">${line}</span>`;
      }

      return line;
    })
    .join('\n');
};

module.exports = ({ markdownAST }) => {
  visit(markdownAST, 'code', (node, index) => {
    const meta = node.meta ? node.lang + node.meta : node.lang;
    const { language, title, highlight } = parseMeta(meta);
    const code = highlightCode(language, node.value, highlight);
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
  });

  return markdownAST;
};
