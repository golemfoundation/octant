import cx from 'classnames';
import React, { FC } from 'react';

import styles from './DoubleValueSkeleton.module.scss';
import DoubleValueSkeletonProps from './types';

const DoubleValueSkeleton: FC<DoubleValueSkeletonProps> = ({ variant, dataTest }) => (
  <div className={cx(styles.root, styles[`variant--${variant}`])} data-test={dataTest}>
    <div className={styles.row} />
    <div className={styles.row} />
  </div>
);

export default DoubleValueSkeleton;
