import fs from 'node:fs/promises';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import fg from 'fast-glob';
import type { Plugin } from 'vite';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] as const;

type CopyContentImagesOptions = {
  contentDir?: string;
  outDir?: string;
};

/**
 * Vite plugin to copy image files from content directory to dist directory
 */
export const copyContentImages = (options: CopyContentImagesOptions = {}): Plugin => {
  const { contentDir = 'content', outDir = 'dist' } = options;

  const isImageFile = (filePath: string): boolean => {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    return IMAGE_EXTENSIONS.includes(ext as (typeof IMAGE_EXTENSIONS)[number]);
  };

  return {
    name: 'copy-content-images',
    configureServer(server) {
      // Serve images from content directory in development server
      server.middlewares.use((req, res, next) => {
        const url = req.url;
        if (!url || !isImageFile(url)) {
          return next();
        }

        // Remove leading slash for proper path resolution
        const cleanUrl = url.startsWith('/') ? url.slice(1) : url;

        // Security: Prevent path traversal attacks
        if (cleanUrl.includes('..') || cleanUrl.includes('//')) {
          return next();
        }

        const filePath = path.join(process.cwd(), contentDir, cleanUrl);

        // Security: Ensure file is within content directory
        const normalizedPath = path.normalize(filePath);
        const contentBasePath = path.join(process.cwd(), contentDir);
        if (!normalizedPath.startsWith(contentBasePath)) {
          return next();
        }

        fs.stat(normalizedPath)
          .then((stats) => {
            if (!stats.isFile()) {
              return next();
            }

            // Set Content-Type
            const ext = path.extname(normalizedPath).toLowerCase();
            const contentType = getContentType(ext);

            res.writeHead(200, {
              'Content-Length': stats.size,
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000',
            });

            createReadStream(normalizedPath).pipe(res);
          })
          .catch(() => {
            next();
          });
      });
    },
    async buildEnd() {
      // Copy images from content directory to outDir only during production build
      if (process.env['NODE_ENV'] === 'development') {
        return;
      }

      const pattern = `**/*.{${IMAGE_EXTENSIONS.join(',')}}`;

      try {
        const imageFiles = await fg(pattern, {
          cwd: contentDir,
          absolute: false,
        });

        await Promise.all(
          imageFiles.map(async (relativePath) => {
            const srcPath = path.join(contentDir, relativePath);
            const destPath = path.join(outDir, relativePath);
            const destDir = path.dirname(destPath);

            // Create output directory
            await fs.mkdir(destDir, { recursive: true });

            // Copy file
            await fs.copyFile(srcPath, destPath);
          }),
        );

        if (imageFiles.length > 0) {
          console.log(`✓ Copied ${imageFiles.length} image files from ${contentDir} to ${outDir}`);
        }
      } catch (error) {
        console.error('Failed to copy content images:', error);
      }
    },
  };
};

const getContentType = (ext: string): string => {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };

  return mimeTypes[ext] || 'application/octet-stream';
};
