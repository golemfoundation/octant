import cx from 'classnames';
import React, { FC } from 'react';

import styles from './Header.module.scss';
import HeaderProps from './types';

const Header: FC<HeaderProps> = ({ text, className }) => (
  <div className={cx(styles.root, className)}>{text}</div>
);

export default Header;
