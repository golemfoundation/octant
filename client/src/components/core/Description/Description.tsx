import cx from 'classnames';
import React, { FC } from 'react';

import styles from './Description.module.scss';
import DescriptionProps from './types';

const Description: FC<DescriptionProps> = ({ className, text, variant = 'medium' }) => (
  <div className={cx(styles.root, styles[`variant--${variant}`], className)}>{text}</div>
);

export default Description;
