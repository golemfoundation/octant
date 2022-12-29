import React, { FC } from 'react';
import cx from 'classnames';

import ProgressBarProps from './types';
import styles from './style.module.scss';

const ProgressBar: FC<ProgressBarProps> = ({ className, progressPercentage }) => (
  <div className={cx(styles.root, className)}>
    <div className={styles.filled} style={{ width: `${progressPercentage}%` }} />
  </div>
);

export default ProgressBar;
