import { parentPort } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';
import fm from 'front-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

/**
 * Generate OG image for a single markdown file
 */
const generateOGImage = async (title, { background, font }) => {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: 1200,
          height: 630,
          backgroundImage: `url(${background})`,
          backgroundSize: '1200px 630px',
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              width: 1040,
              height: 390,
              marginTop: 80,
              marginLeft: 80,
              fontSize: '70px',
              fontWeight: 'bold',
              textOverflow: 'ellipsis',
            },
            children: title,
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'NotoSansJP',
          data: font,
          weight: 500,
          style: 'normal',
        },
      ],
    },
  );

  const resvg = new Resvg(svg);
  return resvg.render().asPng();
};

/**
 * Process a batch of markdown files
 */
const processBatch = async (files, background, font, contentDir, outputDir) => {
  const results = [];

  for (const markdownFile of files) {
    try {
      const markdown = await fs.readFile(markdownFile, 'utf8');
      const { attributes } = fm(markdown);

      // Skip if custom image is specified
      if (attributes.image != null) {
        continue;
      }

      // Generate OG image
      const buffer = await generateOGImage(attributes.title, {
        background,
        font,
      });

      // Determine output path based on content structure
      const relativePath = path.relative(contentDir, markdownFile);
      const routePath = path.dirname(relativePath);
      const outputPath = path.join(outputDir, routePath, 'ogp.png');

      // Ensure directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Write OG image
      await fs.writeFile(outputPath, buffer);

      results.push({
        success: true,
        outputPath,
        file: markdownFile,
      });
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        file: markdownFile,
      });
    }
  }

  return results;
};

// Worker entry point
if (parentPort) {
  parentPort.on('message', async ({ files, background, font, contentDir, outputDir }) => {
    try {
      const results = await processBatch(files, background, font, contentDir, outputDir);
      parentPort.postMessage({ success: true, results });
    } catch (error) {
      parentPort.postMessage({ success: false, error: error.message });
    }
  });
}
