import React from 'react';
import { Props } from '../props';

export const FeedlyIcon: React.FC<Props> = ({ size, ...rest }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 27 24" {...rest}>
      <title>feedly</title>
      <path
        d="M26.118 12.52L14.396.8c-.612-.612-1.604-.612-2.215 0L.46 12.52c-.613.613-.613 1.605 0 2.217l8.776 8.777h8.105l8.777-8.777c.612-.612.612-1.604 0-2.216zM6.614 14.975L5.31 13.67c-.092-.09-.092-.24 0-.33l7.738-7.74c.09-.09.24-.09.33 0l1.742 1.744c.09.09.09.238 0 .33l-7.302 7.3H6.614zm8.58 4.85l-1.303 1.305h-1.204l-1.305-1.305c-.09-.09-.09-.238 0-.33l1.744-1.742c.09-.09.238-.09.33 0l1.74 1.743c.092.09.092.238 0 .33zm.02-6.135l-4.34 4.34H9.67l-1.306-1.305c-.09-.09-.09-.238 0-.33l4.78-4.778c.09-.09.237-.09.328 0l1.742 1.743c.09.09.09.238 0 .33z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

FeedlyIcon.defaultProps = {
  size: 24,
};
