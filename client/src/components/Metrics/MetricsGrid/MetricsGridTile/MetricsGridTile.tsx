import cx from 'classnames';
import React, { FC } from 'react';

import styles from './MetricsGridTile.module.scss';
import MetricsGridTileProps from './types';

const MetricsGridTile: FC<MetricsGridTileProps> = ({
  className,
  dataTest = 'MetricsGridTile',
  groups,
  id,
  size = 'M',
}) => (
  <div className={cx(styles.root, styles[`size--${size}`], className)} data-test={dataTest} id={id}>
    {groups.map((group, idx) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={`${group.title}__${idx}`} className={styles.group} data-test={`${dataTest}__group`}>
        <div
          className={cx(
            styles.groupTitleWrapper,
            group.hasTitleLargeBottomPadding && styles.hasTitleLargeBottomPadding,
          )}
        >
          <div className={styles.title} data-test={`${dataTest}__group__title`}>
            {group.title}
          </div>
          {group.titleSuffix && group.titleSuffix}
        </div>
        {group.children}
      </div>
    ))}
  </div>
);

export default MetricsGridTile;
