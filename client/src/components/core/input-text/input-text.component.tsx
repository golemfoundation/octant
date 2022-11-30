import React, { forwardRef } from 'react';
import cx from 'classnames';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';

import InputTextProps from './types';
import styles from './style.module.scss';

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  ({ className, isDisabled, label, suffix, variant = 'simple', ...rest }, ref) => {
    const inputCommonProps = {
      disabled: isDisabled,
      type: 'text',
    };

    return variant === 'simple' ? (
      <input
        ref={ref}
        className={cx(
          styles.input,
          styles[`variant--${variant}`],
          isDisabled && styles.isDisabled,
          styles.className,
        )}
        {...inputCommonProps}
        {...rest}
      />
    ) : (
      <BoxRounded className={cx(styles.root, className)}>
        {label && <div className={styles.label}>{label}</div>}
        <input
          ref={ref}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className={cx(styles.input, styles[`variant--${variant}`])}
          {...inputCommonProps}
          {...rest}
        />
        {suffix && <div className={styles.suffix}>{suffix}</div>}
      </BoxRounded>
    );
  },
);

export default InputText;
