import cx from 'classnames';
import React, { forwardRef, useEffect, useRef } from 'react';

import Button from 'components/ui/Button';
import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
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
      dataTest = 'InputText',
      shouldAutoFocusAndSelect = true,
      ...rest
    },
    ref,
  ) => {
    const localRef = useRef<HTMLInputElement>(null);

    const inputProps = {
      autoComplete: autocomplete,
      className: cx(
        styles.input,
        styles[`textAlign--${textAlign}`],
        isDisabled && styles.isDisabled,
        !!error && styles.isError,
        suffix && styles.hasSuffix,
        variant === 'allocation' && value && value.length > 8 && styles.smallFontSize,
        styles.className,
      ),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'data-test': dataTest,
      disabled: isDisabled,
      onChange,
      ref: ref || localRef,
      type: 'text',
      value,
      ...rest,
    };

    useEffect(() => {
      const inputRef = inputProps.ref as React.RefObject<HTMLInputElement> | null;
      if (!shouldAutoFocusAndSelect || !inputRef?.current) {
        return;
      }
      inputRef.current.focus();
      inputRef.current.select();
    }, [inputProps.ref, shouldAutoFocusAndSelect]);

    return (
      <div className={cx(styles.root, styles[`variant--${variant}`], className)}>
        <label>
          {label && <div className={styles.label}>{label}</div>}
          <div className={cx(styles.inputWrapper, isDisabled && styles.isDisabled)}>
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
            {showLoader && (
              <Loader className={styles.loader} dataTest={`${dataTest}__Loader`} variant="small" />
            )}
            {suffix && (
              <div
                className={cx(
                  styles.suffix,
                  isDisabled && styles.isDisabled,
                  !!error && styles.isError,
                  suffixClassName,
                )}
              >
                {suffix}
              </div>
            )}
          </div>
          {error && isErrorInlineVisible && variant !== 'allocation' && (
            <div className={styles.error} data-test={`${dataTest}__error`}>
              {error}
            </div>
          )}
        </label>
      </div>
    );
  },
);

export default InputText;
