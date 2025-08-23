import type { PostMeta } from '../lib/types';

type PagerItemProps = {
  post: PostMeta | null;
  label: string;
  align: 'left' | 'right';
};

const PagerItem = ({ post, label, align }: PagerItemProps) => {
  const baseClasses = 'p-4 md:p-8 text-secondary-500';
  const borderClasses = align === 'left' ? 'border-l border-l-slate-300' : '';

  if (post == null) {
    return <span class={`${baseClasses} ${borderClasses}`} />;
  }

  const linkClasses = [
    'group',
    align === 'left' ? 'text-left' : 'text-right',
    borderClasses,
    baseClasses,
    'no-underline',
    'transition duration-300',
    'hover:bg-secondary-500',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a class={linkClasses} href={`/${post.slug}`}>
      <span class="font-accent text-xs md:text-base text-secondary-400 group-hover:text-primary-500">
        {label}
      </span>
      <span class="text-sm md:text-xl line-clamp-2 group-hover:text-white">{post.title}</span>
    </a>
  );
};

type Props = {
  previous: PostMeta | null;
  next: PostMeta | null;
};

export const Pager = ({ previous, next }: Props) => {
  return (
    <nav class="grid grid-cols-2 border-t border-t-slate-300" aria-label="前後記事のナビゲーション">
      <PagerItem post={previous} label="Newer Post" align="right" />
      <PagerItem post={next} label="Older Post" align="left" />
    </nav>
  );
};
