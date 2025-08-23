type Props = {
  size?: number;
  class?: string;
};

export const XIcon = ({ size = 24, class: className, ...rest }: Props) => {
  return (
    <svg
      width={size}
      height={size * (1227 / 1200)}
      viewBox="0 0 1200 1227"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class={className}
      {...rest}
    >
      <path
        d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const GitHubIcon = ({ size = 24, class: className, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" class={className} {...rest}>
      <title>GitHub</title>
      <path
        d="M12 .34c-6.626 0-12 5.374-12 12 0 5.303 3.438 9.8 8.207 11.388.6.11.793-.26.793-.577v-2.233c-3.338.726-4.033-1.416-4.033-1.416-.546-1.386-1.333-1.755-1.333-1.755-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.806 1.304 3.49.997.108-.775.42-1.305.763-1.604-2.665-.305-5.467-1.334-5.467-5.93 0-1.312.47-2.382 1.236-3.222-.125-.303-.536-1.524.116-3.176 0 0 1.008-.322 3.3 1.23.958-.266 1.984-.4 3.004-.404 1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.236 1.91 1.236 3.22 0 4.61-2.807 5.625-5.48 5.922.43.372.824 1.102.824 2.222v3.293c0 .32.192.695.8.577 4.766-1.59 8.2-6.086 8.2-11.386 0-6.626-5.373-12-12-12z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

export const RssIcon = ({ size = 24, class: className, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 21 22" class={className} {...rest}>
      <title>RSS</title>
      <path
        d="M5.69 18.5c0 1.57-1.274 2.84-2.845 2.84C1.275 21.34 0 20.07 0 18.5c0-1.57 1.274-2.843 2.845-2.843 1.57 0 2.845 1.272 2.845 2.842zM0 7.497v4.21c5.294.054 9.59 4.345 9.644 9.633h4.215C13.804 13.72 7.63 7.554 0 7.5zM0 4.55c9.257.042 16.758 7.52 16.785 16.79H21C20.974 9.765 11.59.38 0 .34v4.21z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

export const FeedlyIcon = ({ size = 24, class: className, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 27 24" class={className} {...rest}>
      <title>Feedly</title>
      <path
        d="M26.118 12.52L14.396.8c-.612-.612-1.604-.612-2.215 0L.46 12.52c-.613.613-.613 1.605 0 2.217l8.776 8.777h8.105l8.777-8.777c.612-.612.612-1.604 0-2.216zM6.614 14.975L5.31 13.67c-.092-.09-.092-.24 0-.33l7.738-7.74c.09-.09.24-.09.33 0l1.742 1.744c.09.09.09.238 0 .33l-7.302 7.3H6.614zm8.58 4.85l-1.303 1.305h-1.204l-1.305-1.305c-.09-.09-.09-.238 0-.33l1.744-1.742c.09-.09.238-.09.33 0l1.74 1.743c.092.09.092.238 0 .33zm.02-6.135l-4.34 4.34H9.67l-1.306-1.305c-.09-.09-.09-.238 0-.33l4.78-4.778c.09-.09.237-.09.328 0l1.742 1.743c.09.09.09.238 0 .33z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

export const HatenaIcon = ({ size = 24, class: className, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 20" class={className} {...rest}>
      <title>はてなブックマーク</title>
      <path
        d="M20.474 19.657c1.416 0 2.564-1.148 2.564-2.564 0-1.416-1.148-2.564-2.564-2.564-1.416 0-2.564 1.147-2.564 2.563 0 1.416 1.148 2.564 2.564 2.564zM18.14.34h4.67v12.755h-4.67V.34zm-7.104 8.582s3.227-.204 3.227-4.07c0-4.48-4.04-4.5-6.348-4.5H0v19.315H7.847c6.378 0 7.463-3.486 7.463-5.725 0-2.24-1.085-4.342-4.274-5.02zM4.92 3.99h2.172c.407 0 2.17.173 2.17 1.852 0 1.984-1.525 1.917-2.543 1.917h-1.8V3.99zm2.545 11.57H4.92v-4.24h2.596c1.476 0 2.595.306 2.595 2.12 0 1.815-1.458 2.12-2.645 2.12z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

export const PocketIcon = ({ size = 24, class: className, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 23 21" class={className} {...rest}>
      <title>Pocket</title>
      <path
        d="M20.208.34H2.216C.992.34 0 1.334 0 2.557v6.088c0 .05.002.094.005.137-.003.107-.005.215-.005.326 0 6.192 5.02 11.212 11.212 11.212 6.125 0 11.1-4.913 11.206-11.013.004-.04.006-.084.006-.133V2.557c0-1.224-.993-2.216-2.216-2.216zm-2.735 8.405l-5.02 5.02c-.338.338-.8.48-1.24.427-.443.053-.904-.09-1.244-.428l-5.02-5.02c-.587-.586-.587-1.536 0-2.123.587-.585 1.538-.585 2.124 0l4.138 4.14 4.137-4.14c.586-.585 1.537-.585 2.123 0 .587.587.587 1.54 0 2.125z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

export const ArrowLeftIcon = ({ size = 24, class: className, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 15 24" class={className} {...rest}>
      <title>Left</title>
      <path
        d="M14.453 20.284l-2.945 2.898L0 11.592 11.508 0l2.945 2.898L5.78 11.59l8.673 8.694z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

export const ArrowRightIcon = ({ size = 24, class: className, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 15 24" class={className} {...rest}>
      <title>Right</title>
      <path
        d="M0 2.898L2.946 0l11.507 11.59L2.946 23.183 0 20.284l8.672-8.693L0 2.9z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};
