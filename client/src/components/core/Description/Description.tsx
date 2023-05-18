import cx from 'classnames';
import React, { FC } from 'react';

import styles from './Description.module.scss';
import DescriptionProps from './types';

const Description: FC<DescriptionProps> = ({ className, dataTest, text, variant = 'medium' }) => (
  <div className={cx(styles.root, styles[`variant--${variant}`], className)} data-test={dataTest}>
    {text}
  </div>
);

export default Description;
