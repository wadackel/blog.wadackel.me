import React from 'react';
import { Props } from '../props';

export const ArrowRightIcon: React.FC<Props> = ({ size, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 15 24" {...rest}>
      <title>Right</title>
      <path
        d="M0 2.898L2.946 0l11.507 11.59L2.946 23.183 0 20.284l8.672-8.693L0 2.9z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

ArrowRightIcon.defaultProps = {
  size: 24,
};
