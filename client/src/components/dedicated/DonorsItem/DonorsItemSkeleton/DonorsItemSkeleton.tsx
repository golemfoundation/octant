import React, { FC } from 'react';

import styles from './DonorsItemSkeleton.module.scss';
import DonorsItemSkeletonProps from './types';

const DonorsItemSkeleton: FC<DonorsItemSkeletonProps> = ({ dataTest = 'DonorsItemSkeleton' }) => (
  <div className={styles.root} data-test={dataTest}>
    <div className={styles.icon} />
    <div className={styles.address} />
    <div className={styles.value} />
  </div>
);

export default DonorsItemSkeleton;
