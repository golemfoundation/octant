import cx from 'classnames';
import React, { forwardRef } from 'react';

import Button from 'components/core/Button/Button';
import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import { cross } from 'svg/misc';

import styles from './InputText.module.scss';
import InputTextProps from './types';

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      autocomplete,
      className,
      error,
      isButtonClearVisible = true,
      isDisabled,
      isErrorInlineVisible = true,
      label,
      onChange,
      onClear,
      suffix,
      textAlign = 'left',
      value,
      variant = 'simple',
      suffixClassName,
      showLoader = false,
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
      autoComplete: autocomplete,
      className: cx(
        styles.input,
        styles[`variant--${variant}`],
        styles[`textAlign--${textAlign}`],
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
      className: cx(
        styles.suffix,
        styles[`variant--${variant}`],
        isDisabled && styles.isDisabled,
        suffixClassName,
      ),
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
            {variant === 'simple' && value && isButtonClearVisible && (
              <Button
                className={cx(styles.buttonClear, !!suffix && styles.isSuffix)}
                Icon={<Svg img={cross} size={0.8} />}
                isDisabled={isDisabled}
                onClick={onClear}
                variant="iconOnly2"
              />
            )}
            {showLoader && <Loader className={styles.loader} />}
            {suffix && <div {...suffixProps}>{suffix}</div>}
          </div>
          {error && isErrorInlineVisible && <div className={styles.error}>{error}</div>}
        </label>
      </div>
    );
  },
);

export default InputText;
