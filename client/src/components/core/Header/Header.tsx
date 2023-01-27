import React, { FC } from 'react';

import styles from './style.module.scss';
import HeaderProps from './types';

const Header: FC<HeaderProps> = ({ text }) => <div className={styles.root}>{text}</div>;

export default Header;
