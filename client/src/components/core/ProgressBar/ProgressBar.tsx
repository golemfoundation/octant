import React, { FC } from 'react';
import cx from 'classnames';

import ProgressBarProps from './types';
import styles from './style.module.scss';

const ProgressBar: FC<ProgressBarProps> = ({
  className,
  progressPercentage,
  labelLeft,
  labelRight,
}) => (
  <div className={cx(styles.root, className)}>
    {(labelLeft || labelRight) && (
      <div className={styles.labels}>
        <div className={styles.label}>{labelLeft}</div>
        <div className={styles.label}>{labelRight}</div>
      </div>
    )}
    <div className={styles.bar}>
      <div className={styles.filled} style={{ width: `${progressPercentage}%` }} />
    </div>
  </div>
);

export default ProgressBar;
