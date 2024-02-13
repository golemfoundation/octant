import cx from 'classnames';
import React, { FC } from 'react';

import styles from './ProgressBar.module.scss';
import ProgressBarProps from './types';

const ProgressBar: FC<ProgressBarProps> = ({
  className,
  progressPercentage,
  labelLeft,
  labelRight,
  color = 'green',
  trackColor = 'grey',
  variant = 'normal',
}) => (
  <div className={cx(styles.root, className)}>
    {(labelLeft || labelRight) && (
      <div className={styles.labels}>
        <div className={styles.label}>{labelLeft}</div>
        <div className={styles.label}>{labelRight}</div>
      </div>
    )}
    <div
      className={cx(styles.bar, styles[`variant--${variant}`], styles[`trackColor--${trackColor}`])}
    >
      <div
        className={cx(
          styles.filled,
          styles[`color--${color}`],
          progressPercentage > 0 && styles.isBorderVisible,
        )}
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  </div>
);

export default ProgressBar;
