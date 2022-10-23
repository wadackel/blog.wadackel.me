import type { ComponentProps, FunctionComponent } from 'preact';

export type Props = ComponentProps<'svg'> & {
  size?: number;
};

export const RssIcon: FunctionComponent<Props> = ({ size = 24, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 21 22" {...rest}>
      <title>RSS</title>
      <path
        d="M5.69 18.5c0 1.57-1.274 2.84-2.845 2.84C1.275 21.34 0 20.07 0 18.5c0-1.57 1.274-2.843 2.845-2.843 1.57 0 2.845 1.272 2.845 2.842zM0 7.497v4.21c5.294.054 9.59 4.345 9.644 9.633h4.215C13.804 13.72 7.63 7.554 0 7.5zM0 4.55c9.257.042 16.758 7.52 16.785 16.79H21C20.974 9.765 11.59.38 0 .34v4.21z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};
