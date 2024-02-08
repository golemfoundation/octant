import cx from 'classnames';
import React, { FC } from 'react';

import styles from './AllocationItemSkeleton.module.scss';
import AllocationItemSkeletonProps from './types';

const AllocationItemSkeleton: FC<AllocationItemSkeletonProps> = ({ className }) => (
  <div className={cx(styles.root, className)}>
    <div className={styles.column1}>
      <div className={styles.row}>
        <div className={styles.circle} />
        <div className={styles.rectangle} />
      </div>
    </div>
    <div className={styles.column2}>
      <div className={styles.rectangle} />
    </div>
  </div>
);

export default AllocationItemSkeleton;
