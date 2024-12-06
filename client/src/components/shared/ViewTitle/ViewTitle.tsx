import cx from 'classnames';
import React, { FC } from 'react';

import ViewTitleProps from './types';
import styles from './ViewTitle.module.scss';

const ViewTitle: FC<ViewTitleProps> = ({ children, className, dataTest = 'ViewTitle' }) => {
  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      {children}
    </div>
  );
};

export default ViewTitle;
