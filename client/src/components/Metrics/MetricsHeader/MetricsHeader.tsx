import React, { FC } from 'react';

import BoxRounded from 'components/ui/BoxRounded';

import styles from './MetricsHeader.module.scss';
import MetricsHeaderProps from './types';

const MetricsHeader: FC<MetricsHeaderProps> = ({ title, dataTest = 'MetricsHeader', children }) => {
  return (
    <BoxRounded
      childrenWrapperClassName={styles.boxChildrenWrapper}
      className={styles.root}
      dataTest={dataTest}
    >
      <div className={styles.title}>{title}</div>
      {children}
    </BoxRounded>
  );
};

export default MetricsHeader;
