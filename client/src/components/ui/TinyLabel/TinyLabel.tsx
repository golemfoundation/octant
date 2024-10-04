import cx from 'classnames';
import React, { FC } from 'react';

import styles from './TinyLabel.module.scss';
import TinyLabelProps from './types';

const TinyLabel: FC<TinyLabelProps> = ({ className, text }) => (
  <div className={cx(styles.root, className)}>
    <div className={styles.text}>{text}</div>
  </div>
);

export default TinyLabel;
