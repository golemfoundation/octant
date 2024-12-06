import React, { FC } from 'react';

import styles from './MetricsSectionHeader.module.scss';
import MetricsSectionHeaderProps from './types';

const MetricsSectionHeader: FC<MetricsSectionHeaderProps> = ({
  title,
  dataTest = 'MetricsSectionHeader',
  children,
}) => {
  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.title} data-test={`${dataTest}__title`}>
        {title}
      </div>
      {children}
    </div>
  );
};

export default MetricsSectionHeader;
