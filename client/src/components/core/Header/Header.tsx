import React, { FC } from 'react';

import HeaderProps from './types';
import styles from './style.module.scss';

const Header: FC<HeaderProps> = ({ text }) => <div className={styles.root}>{text}</div>;

export default Header;
