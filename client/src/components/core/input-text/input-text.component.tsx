import React, { FC } from 'react';
import cx from 'classnames';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';

import InputTextProps from './types';
import styles from './style.module.scss';

const InputText: FC<InputTextProps> = ({ className, label, suffix, ...props }) => (
  <BoxRounded className={cx(styles.root, className)}>
    {label && <div className={styles.label}>{label}</div>}
    <input className={styles.input} type="text" {...props} />
    {suffix && <div className={styles.suffix}>{suffix}</div>}
  </BoxRounded>
);

export default InputText;
