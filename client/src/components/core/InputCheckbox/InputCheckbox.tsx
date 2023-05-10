import cx from 'classnames';
import React, { FC } from 'react';

import styles from './InputCheckbox.module.scss';
import InputCheckboxProps from './types';

const InputCheckbox: FC<InputCheckboxProps> = ({
  dataTest = 'InputCheckbox',
  isChecked,
  isDisabled,
  onChange,
}) => (
  <label className={cx(styles.root, isDisabled && styles.isDisabled)}>
    <input
      checked={isChecked}
      className={cx(styles.input, isDisabled && styles.isDisabled)}
      data-test={dataTest}
      disabled={isDisabled}
      onChange={onChange}
      type="checkbox"
    />
    <div className={styles.checkIndicator} />
  </label>
);

export default InputCheckbox;
