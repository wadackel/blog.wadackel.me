type Props = {
  single: boolean;
  url: string;
  date: string;
  title: string;
  excerpt: string;
};

export const Article = ({ single, url, date, title, excerpt }: Props) => {
  const titleClasses = 'leading-normal font-normal text-[1.625rem] md:text-[1.875rem]';

  return (
    <article>
      <header class="text-center">
        {single ? (
          <h1 class={titleClasses}>{title}</h1>
        ) : (
          <h2 class={titleClasses}>
            <a class="block text-secondary-500 no-underline hover:text-primary-500" href={url}>
              {title}
            </a>
          </h2>
        )}
        <p class="mt-4 text-xs md:text-sm">
          Published{' '}
          <time datetime={new Date(date).toISOString().split('T')[0]}>
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </p>
      </header>
      {!single && excerpt && <p class="mt-6">{excerpt}</p>}
    </article>
  );
};
