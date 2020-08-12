import React from 'react';
import { Props } from '../props';

export const ArrowBottomIcon: React.FC<Props> = ({ size, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 15" {...rest}>
      <title>Bottom</title>
      <path
        d="M20.284 0l2.898 2.946-11.59 11.507L0 2.946 2.898 0l8.693 8.672L20.285 0z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

ArrowBottomIcon.defaultProps = {
  size: 24,
};
