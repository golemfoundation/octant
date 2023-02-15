import cx from 'classnames';
import React, { FC } from 'react';

import styles from './Description.module.scss';
import DescriptionProps from './types';

const Description: FC<DescriptionProps> = ({ className, text }) => (
  <div className={cx(styles.root, className)}>{text}</div>
);

export default Description;
