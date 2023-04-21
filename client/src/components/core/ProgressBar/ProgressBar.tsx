import cx from 'classnames';
import React, { FC } from 'react';

import styles from './ProgressBar.module.scss';
import ProgressBarProps from './types';

const ProgressBar: FC<ProgressBarProps> = ({
  className,
  progressPercentage,
  labelLeft,
  labelRight,
  variant = 'green',
}) => (
  <div className={cx(styles.root, className)}>
    {(labelLeft || labelRight) && (
      <div className={styles.labels}>
        <div className={styles.label}>{labelLeft}</div>
        <div className={styles.label}>{labelRight}</div>
      </div>
    )}
    <div className={styles.bar}>
      <div
        className={cx(
          styles.filled,
          styles[`variant--${variant}`],
          progressPercentage > 0 && styles.isBorderVisible,
        )}
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  </div>
);

export default ProgressBar;
