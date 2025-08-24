import { useCallback, useMemo } from 'hono/jsx';
import { XIcon, HatenaIcon, PocketIcon, FeedlyIcon } from '../../components/icons';
import { site } from '../../lib/config';

type ShareButtonProps = {
  href: string;
  'aria-label': string;
  title?: string;
  children: unknown;
  'data-name'?: string;
  'data-width'?: string;
  'data-height'?: string;
  colorVar?: string;
  onClick?: (e: MouseEvent) => void;
};

const ShareButton = ({
  href,
  'aria-label': ariaLabel,
  'data-name': dataName,
  'data-width': dataWidth,
  'data-height': dataHeight,
  colorVar,
  onClick,
  children,
}: ShareButtonProps) => {
  return (
    <a
      class="relative block w-10 h-10 bg-white rounded-full transition duration-500 ease-[var(--ease-out-quint)] before:absolute before:top-1/2 before:left-1/2 before:w-10 before:h-10 before:-mt-5 before:-ml-5 before:border-2 before:border-[color:var(--current-color)] before:rounded-full before:transition before:duration-500 before:ease-[var(--ease-out-quint)] before:z-0 hover:before:opacity-0 hover:before:scale-125 focus-visible:before:opacity-0 focus-visible:before:scale-125 after:absolute after:top-1/2 after:left-1/2 after:w-10 after:h-10 after:-mt-5 after:-ml-5 after:bg-[color:var(--current-color)] after:rounded-full after:opacity-0 after:invisible after:scale-20 after:transition after:duration-250 after:ease-[var(--ease-out-quint)] after:z-0 hover:after:opacity-100 hover:after:visible hover:after:scale-100 focus-visible:after:opacity-100 focus-visible:after:visible focus-visible:after:scale-100 [&:hover>svg]:scale-85 [&:focus-visible>svg]:scale-85 [&:hover>svg]:text-white [&:focus-visible>svg]:text-white [&>svg]:absolute [&>svg]:inset-0 [&>svg]:z-10 [&>svg]:w-auto [&>svg]:h-[14px] [&>svg]:m-auto [&>svg]:transition [&>svg]:duration-500 [&>svg]:ease-[var(--ease-out-quint)]"
      style={{
        color: colorVar,
        '--current-color': colorVar,
      }}
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      aria-label={ariaLabel}
      {...(dataName && { 'data-name': dataName })}
      {...(dataWidth && { 'data-width': dataWidth })}
      {...(dataHeight && { 'data-height': dataHeight })}
      {...(onClick && { onClick })}
    >
      {children}
    </a>
  );
};

type Props = {
  title: string;
  url: string;
};

export default function Share({ title, url: urlProp }: Props) {
  const url = useMemo(() => new URL(urlProp, site.url), [urlProp]);

  const encoded = useMemo(
    () => ({
      title: encodeURIComponent(title),
      url: encodeURIComponent(url.toString()),
    }),
    [title, url],
  );

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();

    const button = e.currentTarget as HTMLAnchorElement;
    const href = encodeURI(decodeURI(button.href));
    const name = button.dataset['name'];
    const width = Number.parseInt(button.dataset['width']!, 10);
    const height = Number.parseInt(button.dataset['height']!, 10);

    window.open(
      href,
      name,
      [
        `width=${width}`,
        `height=${height}`,
        'personalbar=no',
        'menubar=no',
        'toolbar=no',
        'scrollbars=yes',
        'resizable=yes',
      ].join(', '),
    );
  }, []);

  return (
    <ul class="flex justify-center items-center">
      <li class="ml-3 first:ml-0">
        <ShareButton
          href={`http://twitter.com/intent/tweet?text=${encoded.title}%0a${url}`}
          aria-label="この記事をXでシェアする"
          data-name="tweetwindow"
          data-width="550"
          data-height="450"
          colorVar="var(--color-social-x)"
          onClick={handleClick}
        >
          <XIcon size={16} />
        </ShareButton>
      </li>

      <li class="ml-3 first:ml-0">
        <ShareButton
          href={`http://b.hatena.ne.jp/add?mode=confirm&url=${url}&title=${encoded.title}`}
          aria-label="この記事をはてなブックマークに追加する"
          data-name="hatenawindow"
          data-width="500"
          data-height="450"
          colorVar="var(--color-social-hatena)"
          onClick={handleClick}
        >
          <HatenaIcon size={16} />
        </ShareButton>
      </li>

      <li class="ml-3 first:ml-0">
        <ShareButton
          href={`http://getpocket.com/edit?url=${url}&title=${encoded.title}`}
          aria-label="この記事をPocketに追加する"
          data-name="pocketwindow"
          data-width="550"
          data-height="350"
          colorVar="var(--color-social-pocket)"
          onClick={handleClick}
        >
          <PocketIcon size={16} />
        </ShareButton>
      </li>

      <li class="ml-3 first:ml-0">
        <ShareButton
          href={`https://feedly.com/i/subscription/feed%2F${url.origin}`}
          aria-label="このブログをFeedlyに追加する"
          colorVar="var(--color-social-feedly)"
        >
          <FeedlyIcon size={16} />
        </ShareButton>
      </li>
    </ul>
  );
}
