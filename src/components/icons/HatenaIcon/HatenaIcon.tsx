import type { ComponentProps, FunctionComponent } from 'preact';

export type Props = ComponentProps<'svg'> & {
  size?: number;
};

export const HatenaIcon: FunctionComponent<Props> = ({ size = 24, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 20" {...rest}>
      <title>はてなブックマーク</title>
      <path
        d="M20.474 19.657c1.416 0 2.564-1.148 2.564-2.564 0-1.416-1.148-2.564-2.564-2.564-1.416 0-2.564 1.147-2.564 2.563 0 1.416 1.148 2.564 2.564 2.564zM18.14.34h4.67v12.755h-4.67V.34zm-7.104 8.582s3.227-.204 3.227-4.07c0-4.48-4.04-4.5-6.348-4.5H0v19.315H7.847c6.378 0 7.463-3.486 7.463-5.725 0-2.24-1.085-4.342-4.274-5.02zM4.92 3.99h2.172c.407 0 2.17.173 2.17 1.852 0 1.984-1.525 1.917-2.543 1.917h-1.8V3.99zm2.545 11.57H4.92v-4.24h2.596c1.476 0 2.595.306 2.595 2.12 0 1.815-1.458 2.12-2.645 2.12z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};
