import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const outputDir = 'dist';
const manifest = JSON.parse(
  await readFile(path.join(outputDir, '.vite/manifest.json'), 'utf8'),
) as Record<string, { file: string }>;
const client = manifest['app/client.ts'];
assert.ok(client, 'Production build is missing the app/client.ts entry');
await access(path.join(outputDir, client.file));

const files = await readdir(outputDir, { recursive: true });
let islandPages = 0;
for (const file of files.filter((file) => file.endsWith('.html'))) {
  const html = await readFile(path.join(outputDir, file), 'utf8');
  if (!html.includes('<honox-island ')) continue;
  assert.ok(
    html.includes(`<script type="module" src="/${client.file}">`),
    `${file} contains islands but is missing the production client script`,
  );
  islandPages += 1;
}
assert.ok(islandPages > 0, 'No generated island pages were checked');
console.log(`Verified production client script on ${islandPages} island pages`);
