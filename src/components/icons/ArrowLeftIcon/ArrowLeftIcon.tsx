import React from 'react';
import { Props } from '../props';

export const ArrowLeftIcon: React.FC<Props> = ({ size, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 15 24" {...rest}>
      <title>Left</title>
      <path
        d="M14.453 20.284l-2.945 2.898L0 11.592 11.508 0l2.945 2.898L5.78 11.59l8.673 8.694z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

ArrowLeftIcon.defaultProps = {
  size: 24,
};
