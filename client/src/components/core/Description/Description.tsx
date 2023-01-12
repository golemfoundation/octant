import React, { FC } from 'react';
import cx from 'classnames';

import DescriptionProps from './types';
import styles from './style.module.scss';

const Description: FC<DescriptionProps> = ({ className, text }) => (
  <div className={cx(styles.root, className)}>{text}</div>
);

export default Description;
