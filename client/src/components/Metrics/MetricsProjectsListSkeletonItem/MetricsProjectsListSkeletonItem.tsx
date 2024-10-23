import React, { ReactElement, memo } from 'react';

import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './MetricsProjectsListSkeletonItem.module.scss';

const MetricsProjectsListSkeletonItem = (): ReactElement => {
  const { isLargeDesktop } = useMediaQuery();
  return (
    <div className={styles.root}>
      <div className={styles.imageNameGroup}>
        <div className={styles.image} />
        <div className={styles.name} />
      </div>
      {isLargeDesktop && (
        <>
          <div className={styles.numberOfDonors} />
          <div className={styles.value} />
          <div className={styles.value} />
        </>
      )}
      <div className={styles.value} />
    </div>
  );
};

export default memo(MetricsProjectsListSkeletonItem);
