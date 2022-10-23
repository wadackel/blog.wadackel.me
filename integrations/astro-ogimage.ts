import fs from 'fs/promises';
import path from 'path';
import type { AstroIntegration } from 'astro';
import fm from 'front-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const generate = async (
  title: string,
  {
    background,
    font,
  }: {
    background: string;
    font: Buffer;
  },
) => {
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
    } as any,
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

export type CreateAstroOgimageOptions = {
  dist: string;
};

export const createAstroOgimage = ({ dist }: CreateAstroOgimageOptions): AstroIntegration => {
  return {
    name: 'astro-ogimage',
    hooks: {
      'astro:build:done': async ({ routes }) => {
        const pages = routes.filter(
          (route) => route.type === 'page' && route.component.endsWith('.md'),
        );

        const background = await fs.readFile(
          path.resolve(__dirname, 'assets/background.png'),
          'base64',
        );
        const font = await fs.readFile(path.resolve(__dirname, 'assets/NotoSansJP-Bold.otf'));

        await Promise.all(
          pages.map(async (page) => {
            const markdown = await fs.readFile(page.component, 'utf8');
            const { attributes } = fm<{ title: string; image?: string }>(markdown);
            if (attributes.image != null) {
              return;
            }

            const buffer = await generate(attributes.title, {
              background: `data:image/png;base64,${background}`,
              font,
            });

            const filename = path.join(dist, page.route, 'ogp.png');

            await fs.writeFile(filename, buffer);
          }),
        );
      },
    },
  };
};
