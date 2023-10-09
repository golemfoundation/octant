import cx from 'classnames';
import React, { FC } from 'react';

import styles from './MetricsGridTile.module.scss';
import MetricsGridTileProps from './types';

const MetricsGridTile: FC<MetricsGridTileProps> = ({ size = 'M', groups, className }) => (
  <div className={cx(styles.root, styles[`size--${size}`], className)}>
    {groups.map((group, idx) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={`${group.title}__${idx}`} className={styles.group}>
        <div
          className={cx(
            styles.groupTitle,
            group.hasTitileBottomPadding !== false && styles.hasTitileBottomPadding,
          )}
        >
          {group.title}
        </div>
        {group.children}
      </div>
    ))}
  </div>
);

export default MetricsGridTile;
