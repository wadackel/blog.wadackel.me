import Prism from 'prismjs';
import prismComponents from 'prismjs/components.js';
import { visit } from 'unist-util-visit';
import parseRange from 'parse-numeric-range';
import type { Node } from 'unist';

interface CodeNode extends Node {
  type: 'code' | 'html';
  lang?: string;
  meta?: string;
  value: string;
}

interface ParseMetaResult {
  language: string;
  title: string | null;
  highlight: number[] | null;
}

interface CodeData {
  language: string;
  title: string | null;
  highlight: number[] | null;
  node: CodeNode;
}

interface PrismLanguageData {
  alias?: string | string[];
  option?: string;
  require?: string | string[];
}

interface PrismComponents {
  languages: Record<string, PrismLanguageData>;
}

// bash
// bash{1,4-6}
// bash:Example
// bash:"Code Title"
// bash{1,4-6}:Example
// bash{1,4-6}:"Code Title"
const parseMeta = (meta?: string): ParseMetaResult => {
  const result: ParseMetaResult = {
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

  const read = (): string => {
    const token = buffer;
    buffer = '';
    return token;
  };

  const consumeTo = (s: string): void => {
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

const getBaseLanguageName = (nameOrAlias: string): string | undefined => {
  const components = prismComponents as PrismComponents;

  if (components.languages[nameOrAlias]) {
    return nameOrAlias;
  }

  return Object.keys(components.languages).find((language) => {
    const languageData = components.languages[language];
    const alias = languageData?.alias;
    if (!alias) {
      return false;
    }

    return Array.isArray(alias) ? alias.includes(nameOrAlias) : alias === nameOrAlias;
  });
};

const loadLanguage = async (language: string): Promise<void> => {
  const base = getBaseLanguageName(language);
  if (!base) {
    throw new Error(`Prism doesn't support language '${language}'.`);
  }

  if (Prism.languages[base]) {
    return;
  }

  const components = prismComponents as PrismComponents;
  const data = components.languages[base];
  if (data?.option === 'default') {
    return;
  }

  if (data?.require) {
    if (Array.isArray(data.require)) {
      await Promise.all(data.require.map((lang) => loadLanguage(lang)));
    } else {
      await loadLanguage(data.require);
    }
  }

  await import(/* @vite-ignore */ `prismjs/components/prism-${base}.js`);
};

const escape = (code: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': `&amp;`,
    '>': `&gt;`,
    '<': `&lt;`,
    '"': `&quot;`,
    "'": `&#39;`,
  };

  const escapedChars = (char: string): string => htmlEscapes[char] ?? char;

  const chars = Object.keys(htmlEscapes);

  const charsRe = new RegExp(`[${chars.join(``)}]`, `g`);

  const rehasUnescapedChars = new RegExp(charsRe.source);

  return code && rehasUnescapedChars.test(code) ? code.replace(charsRe, escapedChars) : code;
};

const highlightCode = async (
  language: string,
  code: string,
  highlight?: number[] | null,
): Promise<string> => {
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
    if (!grammar) {
      highlighted = escape(code);
    } else {
      highlighted = Prism.highlight(code, grammar, language);
    }
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
  return async (tree: Node): Promise<void> => {
    const codes: CodeData[] = [];

    visit(tree, 'code', (node: CodeNode) => {
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
    aria-label="Copy source code to clipboard"
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
