import cx from 'classnames';
import React, { FC } from 'react';

import styles from './MetricsGrid.module.scss';
import MetricsGridProps from './types';

const MetricsGrid: FC<MetricsGridProps> = ({ children, dataTest = 'MetricsGrid', className }) => {
  return (
    <div className={cx(styles.metricsGrid, className)} data-test={dataTest}>
      {children}
    </div>
  );
};

export default MetricsGrid;
