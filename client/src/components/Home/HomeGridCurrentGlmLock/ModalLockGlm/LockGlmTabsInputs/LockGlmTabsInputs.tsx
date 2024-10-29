import cx from 'classnames';
import React, { forwardRef, useDeferredValue, useEffect, useState } from 'react';

import InputText from 'components/ui/InputText';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';
import {
  comma,
  floatNumberWithUpTo18DecimalPlaces,
  floatNumberWithUpTo2DecimalPlaces,
} from 'utils/regExp';

import styles from './LockGlmTabsInputs.module.scss';
import LockGlmTabsInputsProps from './types';

const LockGlmTabsInputs = forwardRef<HTMLInputElement, LockGlmTabsInputsProps>(
  (
    {
      areInputsDisabled,
      cryptoCurrency,
      dataTest = 'InputsCryptoFiat',
      error,
      inputCryptoProps,
      label,
      mode,
      onChange,
      onInputsFocusChange = () => {},
    },
    ref,
  ) => {
    const {
      data: { displayCurrency, isCryptoMainValueDisplay },
    } = useSettingsStore(({ data }) => ({
      data: {
        displayCurrency: data.displayCurrency,
        isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
      },
    }));
    const { data: cryptoValues } = useCryptoValues(displayCurrency);
    const [fiat, setFiat] = useState('');
    const [isCryptoInputFocused, setIsCryptoInputFocused] = useState(isCryptoMainValueDisplay);
    const [isFiatInputFocused, setIsFiatInputFocused] = useState(!isCryptoMainValueDisplay);
    const isAnyInputFocused = useDeferredValue(isCryptoInputFocused || isFiatInputFocused);

    const inputCryptoPropsLabel = isCryptoMainValueDisplay
      ? { ...inputCryptoProps, error, label, mode }
      : { ...inputCryptoProps, error };
    const inputFiatPropsLabel = isCryptoMainValueDisplay ? { error } : { error, label, mode };

    const cryptoFiatRatio = cryptoValues?.[cryptoCurrency][displayCurrency || 'usd'] || 1;

    const onCryptoValueChange = (value: string) => {
      const valueComma = value.replace(comma, '.');

      if (valueComma && !floatNumberWithUpTo18DecimalPlaces.test(valueComma)) {
        return;
      }

      const cryptoToFiat = valueComma ? (parseFloat(valueComma) * cryptoFiatRatio).toFixed(2) : '';

      setFiat(cryptoToFiat);
      onChange(valueComma);
    };

    const onFiatValueChange = (value: string) => {
      const valueComma = value.replace(comma, '.');

      if (valueComma && !floatNumberWithUpTo2DecimalPlaces.test(valueComma)) {
        return;
      }

      const fiatToCrypto = valueComma ? (parseFloat(valueComma) / cryptoFiatRatio).toFixed(18) : '';
      setFiat(valueComma);
      onChange(fiatToCrypto);
    };

    const handleClear = () => {
      setFiat('');
      if (inputCryptoProps.onClear) {
        inputCryptoProps.onClear();
      }
    };

    useEffect(() => {
      if (!inputCryptoProps.value && fiat) {
        setFiat('');
      }
    }, [inputCryptoProps.value, fiat]);

    useEffect(() => {
      onInputsFocusChange(isAnyInputFocused);
    }, [onInputsFocusChange, isAnyInputFocused]);

    useEffect(() => {
      if ((inputCryptoProps.value && fiat) || (!inputCryptoProps.value && !fiat)) {
        return;
      }

      onCryptoValueChange(inputCryptoProps.value!);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputCryptoProps.value, fiat]);

    return (
      <div className={cx(styles.root, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}>
        <InputText
          ref={isCryptoMainValueDisplay ? ref : undefined}
          autocomplete="off"
          className={cx(styles.input, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}
          dataTest={`${dataTest}__InputText--crypto`}
          inputMode="decimal"
          isDisabled={areInputsDisabled}
          isErrorInlineVisible={false}
          onBlur={() => setIsCryptoInputFocused(false)}
          onChange={e => {
            onCryptoValueChange(e.target.value);
          }}
          onClear={handleClear}
          onFocus={() => setIsCryptoInputFocused(true)}
          placeholder="0.00"
          shouldAutoFocusAndSelect={isCryptoMainValueDisplay}
          shouldAutoFocusAndSelectOnModeChange
          variant="simple"
          {...inputCryptoPropsLabel}
        />
        <InputText
          ref={isCryptoMainValueDisplay ? undefined : ref}
          autocomplete="off"
          className={cx(styles.input, !isCryptoMainValueDisplay && styles.isFiatMainValueDisplay)}
          dataTest={`${dataTest}__InputText--fiat`}
          inputMode="decimal"
          isDisabled={areInputsDisabled}
          isErrorInlineVisible={false}
          onBlur={() => setIsFiatInputFocused(false)}
          onChange={e => onFiatValueChange(e.target.value)}
          onClear={handleClear}
          onFocus={() => setIsFiatInputFocused(true)}
          placeholder="0.00"
          shouldAutoFocusAndSelect={!isCryptoMainValueDisplay}
          shouldAutoFocusAndSelectOnModeChange
          suffix={displayCurrency.toUpperCase()}
          value={fiat}
          {...inputFiatPropsLabel}
        />
      </div>
    );
  },
);

export default LockGlmTabsInputs;
