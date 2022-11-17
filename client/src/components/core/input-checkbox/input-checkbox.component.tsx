import React, { FC } from 'react';

import InputCheckboxProps from './types';
import styles from './style.module.scss';

const InputCheckbox: FC<InputCheckboxProps> = ({ isChecked }) => (
  <label className={styles.root}>
    <input checked={isChecked} className={styles.input} type="checkbox" />
    <div className={styles.checkIndicator} />
  </label>
);

export default InputCheckbox;
