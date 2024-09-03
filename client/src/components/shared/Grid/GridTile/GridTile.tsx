import cx from 'classnames';
import React, { FC } from 'react';

import styles from './GridTile.module.scss';
import GridTileProps from './types';

const GridTile: FC<GridTileProps> = ({
  title,
  titleSuffix,
  children,
  className,
  dataTest = 'GridTile',
  showTitleDivider,
}) => (
  <div className={cx(styles.root, className)} data-test={dataTest}>
    <div className={cx(styles.titleWrapper, showTitleDivider && styles.showTitleDivider)}>
      <div className={styles.title} data-test={`${dataTest}__title`}>
        {title}
      </div>
      {titleSuffix}
    </div>
    {children}
  </div>
);

export default GridTile;
