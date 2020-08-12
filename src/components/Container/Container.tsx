import React from 'react';
import styles from './Container.module.css';

export type Props = {};

export const Container: React.FC<Props> = ({ children }) => {
  return <div className={styles.wrapper}>{children}</div>;
};
