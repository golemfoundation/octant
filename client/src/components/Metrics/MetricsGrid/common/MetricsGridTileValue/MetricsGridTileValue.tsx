import cx from 'classnames';
import React, { FC } from 'react';

import styles from './MetricsGridTileValue.module.scss';
import MetricsGridTileValueProps from './types';

const MetricsGridTileValue: FC<MetricsGridTileValueProps> = ({ value, subvalue, size = 'M' }) => (
  <div className={cx(styles.root, styles[`size--${size}`])}>
    <div className={styles.value}>{value}</div>
    {subvalue && <div className={styles.subvalue}>{subvalue}</div>}
  </div>
);

export default MetricsGridTileValue;
