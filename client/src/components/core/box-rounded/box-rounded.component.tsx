import React, { FC } from 'react';
import cx from 'classnames';

import BoxRoundedProps from './types';
import styles from './style.module.scss';

const BoxRounded: FC<BoxRoundedProps> = ({ className, children }) => (
  <div className={cx(styles.root, className)}>{children}</div>
);

export default BoxRounded;
