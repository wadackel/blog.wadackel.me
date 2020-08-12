import React from 'react';
import { Props } from '../props';

export const PocketIcon: React.FC<Props> = ({ size, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 23 21" {...rest}>
      <title>Pocket</title>
      <path
        d="M20.208.34H2.216C.992.34 0 1.334 0 2.557v6.088c0 .05.002.094.005.137-.003.107-.005.215-.005.326 0 6.192 5.02 11.212 11.212 11.212 6.125 0 11.1-4.913 11.206-11.013.004-.04.006-.084.006-.133V2.557c0-1.224-.993-2.216-2.216-2.216zm-2.735 8.405l-5.02 5.02c-.338.338-.8.48-1.24.427-.443.053-.904-.09-1.244-.428l-5.02-5.02c-.587-.586-.587-1.536 0-2.123.587-.585 1.538-.585 2.124 0l4.138 4.14 4.137-4.14c.586-.585 1.537-.585 2.123 0 .587.587.587 1.54 0 2.125z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

PocketIcon.defaultProps = {
  size: 24,
};
