export type PostMeta = {
  title: string;
  date: string;
  slug: string;
  description?: string;
  excerpt: string;
  tags?: string[];
  update?: string;
  path?: string;
  image?: string;
};

export type Post = PostMeta & {
  html: string;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};
