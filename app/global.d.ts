import type { Context } from 'hono';

declare global {
  interface ImportMeta {
    env: {
      PROD: boolean;
      DEV: boolean;
      [key: string]: unknown;
    };
  }
}

export type HonoEnv = {
  Variables: {
    title?: string;
    description?: string;
    type?: string;
    ogp?: {
      title: string;
      description: string;
      url: string;
      image: string;
      type?: string;
    };
  };
  Bindings: Record<string, unknown>;
};

export type HonoContext = Context<HonoEnv>;
