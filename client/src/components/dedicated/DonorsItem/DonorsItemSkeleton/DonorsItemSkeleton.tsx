import React, { ReactElement } from 'react';

import styles from './DonorsItemSkeleton.module.scss';

const DonorsItemSkeleton = (): ReactElement => (
  <div className={styles.root}>
    <div className={styles.icon} />
    <div className={styles.address} />
    <div className={styles.value} />
  </div>
);

export default DonorsItemSkeleton;
