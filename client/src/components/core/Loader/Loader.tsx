import cx from 'classnames';
import React, { FC } from 'react';

import styles from './Loader.module.scss';
import LoaderProps from './types';

const Loader: FC<LoaderProps> = ({ className, dataTest = 'Loader' }) => (
  <div className={cx(styles.root, className)} data-test={dataTest} />
);

export default Loader;
