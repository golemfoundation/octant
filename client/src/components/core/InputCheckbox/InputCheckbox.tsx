import React, { FC } from 'react';
import cx from 'classnames';

import InputCheckboxProps from './types';
import styles from './style.module.scss';

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
