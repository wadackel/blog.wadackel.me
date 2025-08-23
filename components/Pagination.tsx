import { ArrowLeftIcon, ArrowRightIcon } from './icons';

type PaginationItemProps = {
  href?: string;
  ariaLabel: string;
  disabled: boolean;
  children: any;
};

const PaginationItem = ({ href, ariaLabel, disabled, children }: PaginationItemProps) => {
  const className = `
    relative flex justify-center items-center w-[50px] h-[50px] rounded-full text-secondary-500 transition-all duration-200 ease-out-quint
    before:absolute before:inset-0 before:rounded-full before:border-2 before:border-secondary-500 before:transition-all before:duration-500 before:ease-out-quint
    after:absolute after:inset-0 after:rounded-full after:bg-transparent after:opacity-0 after:scale-[0.2] after:transition-all after:duration-200 after:ease-out-quint
    aria-disabled:text-secondary-50 aria-disabled:before:border-secondary-50
    hover:text-white hover:before:opacity-0 hover:before:scale-110 hover:after:opacity-100 hover:after:bg-secondary-500 hover:after:scale-100
    focus-visible:text-white focus-visible:before:opacity-0 focus-visible:before:scale-110 focus-visible:after:opacity-100 focus-visible:after:bg-secondary-500 focus-visible:after:scale-100
  `.trim();

  return (
    <a class={className} href={href} aria-label={ariaLabel} aria-disabled={disabled}>
      {children}
    </a>
  );
};

type Props = {
  page: number;
  total: number;
  previous: string | null;
  next: string | null;
};

export const Pagination = ({ page, total, previous, next }: Props) => {
  return (
    <nav class="flex justify-center items-center">
      <PaginationItem
        {...(previous && { href: previous })}
        ariaLabel="新しい記事へ遷移"
        disabled={previous == null}
      >
        <ArrowLeftIcon class="relative z-10 ml-[-2px]" size={16} />
      </PaginationItem>

      <span class="mx-4 font-accent">
        Page {page} of {total}
      </span>

      <PaginationItem
        {...(next && { href: next })}
        ariaLabel="古い記事へ遷移"
        disabled={next == null}
      >
        <ArrowRightIcon class="relative z-10 mr-[-2px]" size={16} />
      </PaginationItem>
    </nav>
  );
};
