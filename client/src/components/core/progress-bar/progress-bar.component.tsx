import React, { FC } from 'react';

import ProgressBarProps from './types';
import styles from './style.module.scss';

const ProgressBar: FC<ProgressBarProps> = ({ progressPercentage }) => (
  <div className={styles.root}>
    <div className={styles.filled} style={{ width: `${progressPercentage}%` }} />
  </div>
);

export default ProgressBar;
