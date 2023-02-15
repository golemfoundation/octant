import React, { FC } from 'react';

import styles from './DoubleValue.module.scss';
import DoubleValueProps from './types';

const DoubleValue: FC<DoubleValueProps> = ({ mainValue, alternativeValue }) => (
  <div className={styles.root}>
    <div className={styles.mainValue}>{mainValue}</div>
    {alternativeValue && <div className={styles.alternativeValue}>{alternativeValue}</div>}
  </div>
);

export default DoubleValue;
