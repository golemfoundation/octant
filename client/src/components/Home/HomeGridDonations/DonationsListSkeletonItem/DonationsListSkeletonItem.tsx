import React, { ReactElement, memo } from 'react';

import styles from './DonationsListSkeletonItem.module.scss';

const DonationsListSkeletonItem = (): ReactElement => {
  return (
    <div className={styles.root} data-test="DonationsListSkeletonItem">
      <div className={styles.image} />
      <div className={styles.name} />
      <div className={styles.value} />
    </div>
  );
};

export default memo(DonationsListSkeletonItem);
