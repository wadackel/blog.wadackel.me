import React from 'react';
import { Props } from '../props';

export const ArrowTopIcon: React.FC<Props> = ({ size, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 15" {...rest}>
      <title>Top</title>
      <path
        d="M3.533 14.817L.636 11.872 12.226.364l11.59 11.508-2.896 2.945-8.693-8.67-8.694 8.67z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

ArrowTopIcon.defaultProps = {
  size: 24,
};
