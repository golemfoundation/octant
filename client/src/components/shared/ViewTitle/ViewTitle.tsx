import cx from 'classnames';
import React, { FC } from 'react';

import ViewTitleProps from './types';
import styles from './ViewTitle.module.scss';

const ViewTitle: FC<ViewTitleProps> = ({ children, className }) => {
  return <div className={cx(styles.root, className)}>{children}</div>;
};

export default ViewTitle;
