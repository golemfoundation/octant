import React, { ReactElement } from 'react';

import styles from './AllocationItemSkeleton.module.scss';

const AllocationItemSkeleton = (): ReactElement => (
  <div className={styles.root}>
    <div className={styles.column1}>
      <div className={styles.row}>
        <div className={styles.circle} />
        <div className={styles.rectangle} />
      </div>
      <div className={styles.row}>
        <div className={styles.rectangle} />
      </div>
    </div>
    <div className={styles.column2}>
      <div className={styles.rectangle} />
      <div className={styles.rectangle} />
    </div>
  </div>
);

export default AllocationItemSkeleton;
