import React, { FC } from 'react';

import DoubleValueProps from './types';
import styles from './style.module.scss';

const DoubleValue: FC<DoubleValueProps> = ({ mainValue, alternativeValue }) => (
  <div className={styles.root}>
    <div className={styles.mainValue}>{mainValue}</div>
    {alternativeValue && <div className={styles.alternativeValue}>{alternativeValue}</div>}
  </div>
);

export default DoubleValue;
