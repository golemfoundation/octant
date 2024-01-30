import React, { ReactElement, memo } from 'react';

import styles from './MetricsProjectsListSkeletonItem.module.scss';

const MetricsProjectsListSkeletonItem = (): ReactElement => {
  return (
    <div className={styles.root}>
      <div className={styles.image} />
      <div className={styles.name} />
      <div className={styles.value} />
    </div>
  );
};

export default memo(MetricsProjectsListSkeletonItem);
