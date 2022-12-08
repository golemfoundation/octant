import React, { FC } from 'react';
import cx from 'classnames';

import LoaderProps from './types';
import styles from './style.module.scss';

const Loader: FC<LoaderProps> = ({ className }) => <div className={cx(styles.root, className)} />;

export default Loader;
