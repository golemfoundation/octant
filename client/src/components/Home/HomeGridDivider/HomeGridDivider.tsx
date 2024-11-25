import cx from 'classnames';
import React, { FC, memo } from 'react';

import styles from './HomeGridDivider.module.scss';
import HomeGridDividerProps from './types';

const HomeGridDivider: FC<HomeGridDividerProps> = ({ className, dataTest = 'HomeGridDivider' }) => {
  return <div className={cx(styles.root, className)} data-test={dataTest} />;
};

export default memo(HomeGridDivider);
