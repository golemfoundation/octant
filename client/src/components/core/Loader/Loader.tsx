import cx from 'classnames';
import React, { FC } from 'react';

import styles from './style.module.scss';
import LoaderProps from './types';

const Loader: FC<LoaderProps> = ({ className }) => <div className={cx(styles.root, className)} />;

export default Loader;
