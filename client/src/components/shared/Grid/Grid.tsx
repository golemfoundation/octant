import cx from 'classnames';
import React, { FC } from 'react';

import styles from './Grid.module.scss';
import GridProps from './types';

const Grid: FC<GridProps> = ({
  children,
  dataTest = 'Grid',
  className,
  isFourInARowEnabled = true,
}) => {
  return (
    <div
      className={cx(styles.root, isFourInARowEnabled && styles.isFourInARowEnabled, className)}
      data-test={dataTest}
    >
      {children}
    </div>
  );
};

export default Grid;
