import cx from 'classnames';
import React, { FC } from 'react';

import styles from './MetricsGridTileValue.module.scss';
import MetricsGridTileValueProps from './types';

const MetricsGridTileValue: FC<MetricsGridTileValueProps> = ({
  value,
  subvalue,
  size = 'M',
  isLoading = false,
  showSubvalueLoader = true,
  isThinSubvalueLoader = false,
  dataTest = 'MetricsGridTileValue',
}) => (
  <div
    className={cx(styles.root, styles[`size--${size}`], isLoading && styles.isLoading)}
    data-test={dataTest}
  >
    <div className={cx(styles.value)} data-test={`${dataTest}__value`}>
      {!isLoading && value}
    </div>
    {(subvalue || showSubvalueLoader) && (
      <div
        className={cx(styles.subvalue, isThinSubvalueLoader && styles.isThinSubvalueLoader)}
        data-test={`${dataTest}__subvalue`}
      >
        {!isLoading && subvalue}
      </div>
    )}
  </div>
);

export default MetricsGridTileValue;
