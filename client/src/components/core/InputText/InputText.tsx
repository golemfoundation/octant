import cx from 'classnames';
import React, { forwardRef } from 'react';

import styles from './InputText.module.scss';
import InputTextProps from './types';

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  ({ className, isDisabled, label, suffix, variant = 'simple', ...rest }, ref) => {
    const rootProps = {
      className: cx(styles.root, className),
    };

    const inputWrapperProps = {
      className: cx(
        styles.inputWrapper,
        styles[`variant--${variant}`],
        isDisabled && styles.isDisabled,
      ),
    };

    const inputProps = {
      className: cx(
        styles.input,
        styles[`variant--${variant}`],
        isDisabled && styles.isDisabled,
        styles.className,
      ),
      disabled: isDisabled,
      ref,
      type: 'text',
    };

    const labelProps = {
      className: cx(styles.label, styles[`variant--${variant}`]),
    };

    const suffixProps = {
      className: cx(styles.suffix, styles[`variant--${variant}`]),
    };

    if (variant === 'borderless') {
      return <input {...inputProps} {...rest} />;
    }

    return (
      <div {...rootProps}>
        <label>
          <div {...labelProps}>{label}</div>
          <div {...inputWrapperProps}>
            <input {...inputProps} {...rest} />
            {suffix && <div {...suffixProps}>{suffix}</div>}
          </div>
        </label>
      </div>
    );
  },
);

export default InputText;
