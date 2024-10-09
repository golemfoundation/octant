import cx from 'classnames';
import React, { ReactElement } from 'react';

import styles from './TransactionsSkeleton.module.scss';

const TransactionsSkeleton = (): ReactElement => {
  return (
    <div className={styles.root}>
      <div>
        <div className={cx(styles.box, styles.long)} />
        <div className={cx(styles.box, styles.short)} />
      </div>
      <div className={styles.column}>
        <div className={styles.box} />
        <div className={styles.box} />
      </div>
    </div>
  );
};

export default TransactionsSkeleton;
