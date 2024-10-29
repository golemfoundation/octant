import cx from 'classnames';
import React, { FC, memo } from 'react';

import styles from './HomeGridDivider.module.scss';
import HomeGridDividerProps from './types';

const HomeGridDivider: FC<HomeGridDividerProps> = ({ className }) => {
  return <div className={cx(styles.root, className)} />;
};

export default memo(HomeGridDivider);
