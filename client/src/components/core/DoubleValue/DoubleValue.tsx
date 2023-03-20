import cx from 'classnames';
import React, { FC } from 'react';

import styles from './DoubleValue.module.scss';
import DoubleValueProps from './types';

const DoubleValue: FC<DoubleValueProps> = ({
  className,
  mainValue,
  alternativeValue,
  variant = 'standard',
}) => (
  <div className={cx(styles.root, className)}>
    <div className={cx(styles.mainValue, styles[`variant--${variant}`])}>{mainValue}</div>
    {alternativeValue && <div className={styles.alternativeValue}>{alternativeValue}</div>}
  </div>
);

export default DoubleValue;
