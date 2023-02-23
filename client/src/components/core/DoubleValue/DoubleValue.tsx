import cx from 'classnames';
import React, { FC } from 'react';

import styles from './DoubleValue.module.scss';
import DoubleValueProps from './types';

const DoubleValue: FC<DoubleValueProps> = ({ className, mainValue, alternativeValue }) => (
  <div className={cx(styles.root, className)}>
    <div className={styles.mainValue}>{mainValue}</div>
    {alternativeValue && <div className={styles.alternativeValue}>{alternativeValue}</div>}
  </div>
);

export default DoubleValue;
