import cx from 'classnames';
import React, { FC } from 'react';

import Svg from 'components/ui/Svg';
import { checkboxChecked } from 'svg/checkbox';

import styles from './InputCheckbox.module.scss';
import InputCheckboxProps from './types';

const InputCheckbox: FC<InputCheckboxProps> = ({
  isChecked,
  isDisabled,
  dataTest = 'InputCheckbox',
  onChange,
  inputId,
}) => {
  return (
    <div className={cx(styles.root, isDisabled && styles.disabled)}>
      <input
        checked={isChecked}
        className={styles.input}
        data-test={dataTest}
        disabled={isDisabled}
        id={inputId}
        onChange={onChange}
        type="checkbox"
      />
      {isChecked && <Svg classNameSvg={styles.svgChecked} img={checkboxChecked} size={2.4} />}
    </div>
  );
};

export default InputCheckbox;
