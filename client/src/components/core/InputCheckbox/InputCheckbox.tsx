import cx from 'classnames';
import React, { FC } from 'react';

import styles from './style.module.scss';
import InputCheckboxProps from './types';

const InputCheckbox: FC<InputCheckboxProps> = ({ isChecked, isDisabled }) => (
  <label className={cx(styles.root, isDisabled && styles.isDisabled)}>
    <input
      checked={isChecked}
      className={cx(styles.input, isDisabled && styles.isDisabled)}
      disabled={isDisabled}
      type="checkbox"
    />
    <div className={styles.checkIndicator} />
  </label>
);

export default InputCheckbox;
