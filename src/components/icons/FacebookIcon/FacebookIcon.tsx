import React from 'react';
import { Props } from '../props';

export const FacebookIcon: React.FC<Props> = ({ size, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 9 18" {...rest}>
      <title>Facebook</title>
      <path
        d="M2.25 6H0v3h2.25v9H6V9h2.73L9 6H6V4.75c0-.716.144-1 .836-1H9V0H6.144C3.447 0 2.25 1.187 2.25 3.46V6z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

FacebookIcon.defaultProps = {
  size: 24,
};
