import cx from 'classnames';
import React, { FC } from 'react';

import styles from './TinyLabel.module.scss';
import TinyLabelProps from './types';

const TinyLabel: FC<TinyLabelProps> = ({
  className,
  text,
  variant = 'orange2',
  isInTopRightCorner = true,
  textClassName,
  onClick,
  dataTest = 'TinyLabel',
}) => (
  <div
    className={cx(styles.root, isInTopRightCorner && styles.isInTopRightCorner, className)}
    data-test={dataTest}
    onClick={onClick}
  >
    <div className={cx(styles.text, styles[`variant--${variant}`], textClassName)}>{text}</div>
  </div>
);

export default TinyLabel;
