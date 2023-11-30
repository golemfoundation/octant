import React, { ReactElement } from 'react';

import styles from './DoubleValueSkeleton.module.scss';

const DoubleValueSkeleton = (): ReactElement => (
  <div className={styles.root}>
    <div className={styles.row} />
    <div className={styles.row} />
  </div>
);

export default DoubleValueSkeleton;
