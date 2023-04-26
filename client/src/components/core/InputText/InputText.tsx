import cx from 'classnames';
import React, { forwardRef } from 'react';

import Svg from 'components/core/Svg/Svg';
import { cross } from 'svg/misc';

import styles from './InputText.module.scss';
import InputTextProps from './types';

import Button from '../Button/Button';

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      className,
      isDisabled,
      error,
      label,
      suffix,
      isErrorInlineVisible = true,
      variant = 'simple',
      onChange,
      onClear,
      value,
      ...rest
    },
    ref,
  ) => {
    const rootProps = {
      className: cx(styles.root, className),
    };

    const inputWrapperProps = {
      className: cx(styles.inputWrapper, isDisabled && styles.isDisabled),
    };

    const inputProps = {
      className: cx(
        styles.input,
        styles[`variant--${variant}`],
        isDisabled && styles.isDisabled,
        !!error && styles.isError,
        styles.className,
      ),
      disabled: isDisabled,
      onChange,
      ref,
      type: 'text',
      value,
      ...rest,
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
          {label && <div {...labelProps}>{label}</div>}
          <div {...inputWrapperProps}>
            <input {...inputProps} />
            {variant === 'simple' && value && (
              <Button
                className={cx(styles.buttonClear, !!suffix && styles.isSuffix)}
                Icon={<Svg img={cross} size={0.8} />}
                isDisabled={isDisabled}
                onClick={onClear}
                variant="iconOnly2"
              />
            )}
            {suffix && <div {...suffixProps}>{suffix}</div>}
          </div>
          {error && isErrorInlineVisible && <div className={styles.error}>{error}</div>}
        </label>
      </div>
    );
  },
);

export default InputText;
