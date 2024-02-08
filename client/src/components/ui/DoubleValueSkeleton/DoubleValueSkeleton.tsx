import React, { FC } from 'react';

import styles from './DoubleValueSkeleton.module.scss';
import DoubleValueSkeletonProps from './types';

const DoubleValueSkeleton: FC<DoubleValueSkeletonProps> = ({ dataTest }) => (
  <div className={styles.root} data-test={dataTest}>
    <div className={styles.row} />
    <div className={styles.row} />
  </div>
);

export default DoubleValueSkeleton;
