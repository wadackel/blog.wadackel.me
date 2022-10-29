import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { AstroIntegration } from 'astro';
import { globby } from 'globby';
import { lookup } from 'mrmime';

const extensions = ['jpg', 'jpeg', 'png', 'gif'];

const directoryExists = async (target: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(target);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
};

export type CreateAstroCopyImagesOptions = {
  src: string;
  dist: string;
};

export const createAstroCopyImages = ({
  src,
  dist,
}: CreateAstroCopyImagesOptions): AstroIntegration => {
  return {
    name: 'astro-copy-images',
    hooks: {
      'astro:server:setup': async ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const url = req.url;
          if (url == null) {
            return next();
          }

          const ctype = lookup(url);
          if (ctype == null) {
            return next();
          }

          const [type] = ctype.split('/');
          if (type !== 'image') {
            return next();
          }

          const filepath = path.join(src, url);

          fs.stat(filepath)
            .then((stats) => {
              if (!stats.isFile()) {
                return next();
              }

              res.writeHead(200, {
                'content-length': stats.size,
                'content-type': ctype,
                vary: 'Accept-Encoding',
              });

              createReadStream(filepath, {}).pipe(res);
            })
            .catch(() => {
              next();
            });
        });
      },
      'astro:build:done': async () => {
        const images = await globby(`**/*.+(${extensions.join('|')})`, {
          cwd: src,
          absolute: false,
        });

        await Promise.all(
          images.map(async (image) => {
            const filepath = path.join(dist, image);
            const dirname = path.dirname(filepath);
            const exists = await directoryExists(dirname);
            if (!exists) {
              return;
            }

            await fs.copyFile(path.join(src, image), filepath);
          }),
        );
      },
    },
  };
};
