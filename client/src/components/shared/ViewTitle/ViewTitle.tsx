import React, { FC, ReactNode } from 'react';

import styles from './ViewTitle.module.scss';

const ViewTitle: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={styles.root}>{children}</div>;
};

export default ViewTitle;
