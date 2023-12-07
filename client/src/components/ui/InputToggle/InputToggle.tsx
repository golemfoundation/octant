import cx from 'classnames';
import React, { FC } from 'react';

import styles from './InputToggle.module.scss';
import InputToggleProps from './types';

const InputToggle: FC<InputToggleProps> = ({
  className,
  dataTest = 'InputToggle',
  isChecked,
  isDisabled,
  onChange,
}) => (
  <label className={cx(styles.root, className, isDisabled && styles.isDisabled)}>
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

export default InputToggle;
