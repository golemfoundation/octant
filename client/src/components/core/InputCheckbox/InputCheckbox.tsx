import cx from 'classnames';
import React, { FC } from 'react';

import styles from './InputCheckbox.module.scss';
import InputCheckboxProps from './types';

const InputCheckbox: FC<InputCheckboxProps> = ({ isChecked, isDisabled, onChange }) => (
  <label className={cx(styles.root, isDisabled && styles.isDisabled)}>
    <input
      checked={isChecked}
      className={cx(styles.input, isDisabled && styles.isDisabled)}
      disabled={isDisabled}
      onChange={onChange}
      type="checkbox"
    />
    <div className={styles.checkIndicator} />
  </label>
);

export default InputCheckbox;
