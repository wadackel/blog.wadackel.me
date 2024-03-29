import type { ComponentProps, FunctionComponent } from 'preact';

export type Props = ComponentProps<'svg'> & {
  size?: number;
};

export const TwitterIcon: FunctionComponent<Props> = ({ size = 24, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 20" {...rest}>
      <title>Twitter</title>
      <path
        d="M21.172 3.425C22.19 2.815 22.97 1.85 23.337.7c-.95.565-2.005.975-3.127 1.196C19.313.94 18.032.34 16.616.34c-3.18 0-5.515 2.967-4.797 6.046C7.727 6.18 4.1 4.22 1.67 1.242.38 3.455 1.003 6.35 3.195 7.816 2.388 7.79 1.628 7.57.964 7.2c-.053 2.28 1.582 4.415 3.95 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.38 4.6 3.42-2.07 1.622-4.678 2.347-7.29 2.04 2.18 1.396 4.768 2.21 7.548 2.21 9.142 0 14.307-7.72 13.995-14.645.962-.696 1.797-1.563 2.457-2.55-.883.392-1.832.656-2.828.775z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};
