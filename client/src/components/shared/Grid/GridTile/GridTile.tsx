import cx from 'classnames';
import React, { FC } from 'react';

import styles from './GridTile.module.scss';
import GridTileProps from './types';

const GridTile: FC<GridTileProps> = ({
  title,
  titleSuffix,
  children,
  className,
  classNameTitleWrapper,
  dataTest = 'GridTile',
  showTitleDivider,
  ...rest
}) => (
  <div className={cx(styles.root, className)} data-test={dataTest} {...rest}>
    <div
      className={cx(
        styles.titleWrapper,
        showTitleDivider && styles.showTitleDivider,
        classNameTitleWrapper,
      )}
    >
      <div className={styles.title} data-test={`${dataTest}__title`}>
        {title}
      </div>
      {titleSuffix}
    </div>
    {children}
  </div>
);

export default GridTile;
