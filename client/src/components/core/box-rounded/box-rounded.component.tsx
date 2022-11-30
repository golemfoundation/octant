import React, { FC } from 'react';
import cx from 'classnames';

import BoxRoundedProps from './types';
import styles from './style.module.scss';

const BoxRounded: FC<BoxRoundedProps> = ({ className, children, onClick }) => (
  <div className={cx(styles.root, onClick && styles.isClickable, className)} onClick={onClick}>
    {children}
  </div>
);

export default BoxRounded;
