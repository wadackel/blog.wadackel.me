import { describe, test, expect } from 'vitest';
import { renderComponentWithMarkdown, takeScreenshot } from '../tests/utils/hono-test-helper';
import { PostContent } from './PostContent';

describe('PostContent Component', () => {
  test('renders basic text content', async () => {
    const markdown = `
This is a basic paragraph with **bold text** and *italic text*.

This paragraph contains a [link to an external site](https://example.com) and demonstrates
how links are styled within post content.

Another paragraph to show spacing between text blocks.
`;

    const container = await renderComponentWithMarkdown(
      (html) => <PostContent>{<div dangerouslySetInnerHTML={{ __html: html }} />}</PostContent>,
      markdown,
    );

    const postContent = container.querySelector('.post-content')!;
    expect(postContent).toBeTruthy();

    const paragraphs = postContent.querySelectorAll('p');
    expect(paragraphs).toHaveLength(3);

    const boldText = postContent.querySelector('strong');
    const italicText = postContent.querySelector('em');
    const link = postContent.querySelector('a');
    expect(boldText).toBeTruthy();
    expect(italicText).toBeTruthy();
    expect(link).toBeTruthy();

    await takeScreenshot({ element: postContent });
  });

  test('renders headings with anchor links', async () => {
    const markdown = `
## Main Heading

Content under the main heading.

### Sub Heading

Content under the sub heading.

#### Minor Heading

Content under the minor heading.
`;

    const container = await renderComponentWithMarkdown(
      (html) => <PostContent>{<div dangerouslySetInnerHTML={{ __html: html }} />}</PostContent>,
      markdown,
    );

    const postContent = container.querySelector('.post-content')!;
    const h2 = postContent.querySelector('h2');
    const h3 = postContent.querySelector('h3');
    const h4 = postContent.querySelector('h4');
    expect(h2).toBeTruthy();
    expect(h3).toBeTruthy();
    expect(h4).toBeTruthy();

    const anchors = postContent.querySelectorAll('.heading-anchor');
    expect(anchors.length).toBeGreaterThan(0);

    await takeScreenshot({ element: postContent });
  });

  test('renders lists with proper styling', async () => {
    const markdown = `
### Unordered List

- First item
- Second item with nested list:
  - Nested item 1
  - Nested item 2 with deeper nesting:
    - Deep nested item
- Third item

### Ordered List

1. First numbered item
2. Second numbered item
3. Third numbered item with multiple lines of text to demonstrate how longer content is handled in list items
`;

    const container = await renderComponentWithMarkdown(
      (html) => <PostContent>{<div dangerouslySetInnerHTML={{ __html: html }} />}</PostContent>,
      markdown,
    );

    const postContent = container.querySelector('.post-content')!;
    const ul = postContent.querySelector('ul');
    const ol = postContent.querySelector('ol');
    expect(ul).toBeTruthy();
    expect(ol).toBeTruthy();

    const nestedUls = postContent.querySelectorAll('ul ul');
    expect(nestedUls.length).toBeGreaterThan(0);

    await takeScreenshot({ element: postContent });
  });

  test('renders code blocks with syntax highlighting', async () => {
    const markdown = `
### Inline Code

Here is some \`inline code\` within a paragraph.

### Code Block

\`\`\`javascript
function example() {
  const message = "Hello, world!";
  console.log(message);
  return message;
}
\`\`\`

### Code Block with Title

\`\`\`javascript:example.js
// This is a comment
const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
];

users.map(user => user.name);
\`\`\`
`;

    const container = await renderComponentWithMarkdown(
      (html) => <PostContent>{<div dangerouslySetInnerHTML={{ __html: html }} />}</PostContent>,
      markdown,
    );

    const postContent = container.querySelector('.post-content')!;
    const inlineCode = postContent.querySelector('p code');
    const codeBlocks = postContent.querySelectorAll('.highlight');
    expect(inlineCode).toBeTruthy();
    expect(codeBlocks.length).toBeGreaterThan(0);

    const highlightTitle = postContent.querySelector('.highlight_title');
    expect(highlightTitle).toBeTruthy();

    await takeScreenshot({ element: postContent });
  });

  test('renders blockquotes', async () => {
    const markdown = `
### Standard Blockquote

> This is a blockquote with some important information that needs to be highlighted.
> 
> Blockquotes can contain multiple paragraphs.

### Regular Content

This is regular content after the blockquote to show the styling difference.
`;

    const container = await renderComponentWithMarkdown(
      (html) => <PostContent>{<div dangerouslySetInnerHTML={{ __html: html }} />}</PostContent>,
      markdown,
    );

    const postContent = container.querySelector('.post-content')!;
    const blockquote = postContent.querySelector('blockquote');
    expect(blockquote).toBeTruthy();

    const paragraphsInQuote = blockquote?.querySelectorAll('p');
    expect(paragraphsInQuote?.length).toBeGreaterThan(0);

    await takeScreenshot({ element: postContent });
  });

  test('renders tables', async () => {
    const markdown = `
### Data Table

| Name    | Age | City          |
|---------|-----|---------------|
| Alice   | 30  | New York      |
| Bob     | 25  | San Francisco |
| Charlie | 35  | Chicago       |
`;

    const container = await renderComponentWithMarkdown(
      (html) => <PostContent>{<div dangerouslySetInnerHTML={{ __html: html }} />}</PostContent>,
      markdown,
    );

    const postContent = container.querySelector('.post-content')!;
    const table = postContent.querySelector('table');
    expect(table).toBeTruthy();

    const thead = table?.querySelector('thead');
    const tbody = table?.querySelector('tbody');
    expect(thead).toBeTruthy();
    expect(tbody).toBeTruthy();

    const rows = tbody?.querySelectorAll('tr');
    expect(rows?.length).toBe(3);

    await takeScreenshot({ element: postContent });
  });

  test('renders inline elements', async () => {
    const markdown = `
### Inline Elements

This paragraph demonstrates various inline elements: 
\`inline code\`, and [links](#), and **bold text** with *italic text*.

Regular content continues here.

---

Content after a horizontal rule.
`;

    const container = await renderComponentWithMarkdown(
      (html) => <PostContent>{<div dangerouslySetInnerHTML={{ __html: html }} />}</PostContent>,
      markdown,
    );

    const postContent = container.querySelector('.post-content')!;
    const inlineCode = postContent.querySelector('code');
    const link = postContent.querySelector('a');
    const hr = postContent.querySelector('hr');
    const strong = postContent.querySelector('strong');
    const em = postContent.querySelector('em');

    expect(inlineCode).toBeTruthy();
    expect(link).toBeTruthy();
    expect(hr).toBeTruthy();
    expect(strong).toBeTruthy();
    expect(em).toBeTruthy();

    await takeScreenshot({ element: postContent });
  });

  test('renders comprehensive article content', async () => {
    const markdown = `
## Introduction

This is a comprehensive example of post content that combines multiple elements 
to demonstrate the complete styling capabilities of the \`PostContent\` component.

### Key Features

- Typography with proper spacing
- Code highlighting with \`inline code\`
- Interactive elements and links

> "The best way to understand styling is to see it in action with real content."

#### Code Example

\`\`\`typescript:main.ts
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  return response.json();
}
\`\`\`

| Method | Description  | Example       |
|--------|--------------|---------------|
| GET    | Retrieve data| \`/api/users\`  |
| POST   | Create data  | \`/api/users\`  |

For more information, visit the [documentation](https://example.com) 
or check the [\`API reference\`](#).

---

**Final note:** This demonstrates the full range of markdown processing capabilities.
`;

    const container = await renderComponentWithMarkdown(
      (html) => <PostContent>{<div dangerouslySetInnerHTML={{ __html: html }} />}</PostContent>,
      markdown,
    );

    const postContent = container.querySelector('.post-content')!;
    expect(postContent).toBeTruthy();

    // Verify various elements are present
    const headings = postContent.querySelectorAll('h2, h3, h4');
    const list = postContent.querySelector('ul');
    const blockquote = postContent.querySelector('blockquote');
    const codeBlock = postContent.querySelector('.highlight');
    const table = postContent.querySelector('table');
    const hr = postContent.querySelector('hr');

    expect(headings.length).toBeGreaterThan(0);
    expect(list).toBeTruthy();
    expect(blockquote).toBeTruthy();
    expect(codeBlock).toBeTruthy();
    expect(table).toBeTruthy();
    expect(hr).toBeTruthy();

    await takeScreenshot({ element: postContent });
  });
});
