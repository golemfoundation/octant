import cx from 'classnames';
import React, { FC } from 'react';

import styles from './Text.module.scss';
import TextProps from './types';

const Text: FC<TextProps> = ({ children, className }) => (
  <div className={cx(styles.text, className)}>{children}</div>
);

export default Text;
