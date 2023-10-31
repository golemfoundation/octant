import cx from 'classnames';
import React, { FC, useDeferredValue, useEffect, useState } from 'react';

import InputText from 'components/core/InputText/InputText';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';
import {
  comma,
  floatNumberWithUpTo18DecimalPlaces,
  floatNumberWithUpTo2DecimalPlaces,
} from 'utils/regExp';

import styles from './InputsCryptoFiat.module.scss';
import InputsCryptoFiatProps from './types';

const InputsCryptoFiat: FC<InputsCryptoFiatProps> = ({
  error,
  label,
  inputCryptoProps,
  cryptoCurrency,
  areInputsDisabled,
  onInputsFocusChange = () => {},
}) => {
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
  const [isCryptoInputFocused, setIsCryptoInputFocused] = useState(false);
  const [isFiatInputFocused, setIsFiatInputFocused] = useState(false);
  const isAnyInputFocused = useDeferredValue(isCryptoInputFocused || isFiatInputFocused);

  const inputCryptoPropsLabel = isCryptoMainValueDisplay
    ? { ...inputCryptoProps, error, label }
    : { ...inputCryptoProps, error };
  const inputFiatPropsLabel = isCryptoMainValueDisplay ? { error } : { error, label };

  const cryptoFiatRatio = cryptoValues?.[cryptoCurrency][displayCurrency || 'usd'] || 1;

  const onCryptoValueChange = (value: string) => {
    const valueComma = value.replace(comma, '.');

    if (valueComma && !floatNumberWithUpTo18DecimalPlaces.test(valueComma)) {
      return;
    }

    const cryptoToFiat = valueComma ? (parseFloat(valueComma) * cryptoFiatRatio).toFixed(2) : '';

    setFiat(cryptoToFiat);
    inputCryptoProps.onChange(valueComma);
  };

  const onFiatValueChange = (value: string) => {
    const valueComma = value.replace(comma, '.');

    if (valueComma && !floatNumberWithUpTo2DecimalPlaces.test(valueComma)) {
      return;
    }

    const fiatToCrypto = valueComma ? (parseFloat(valueComma) / cryptoFiatRatio).toFixed(18) : '';
    setFiat(valueComma);
    inputCryptoProps.onChange(fiatToCrypto);
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
        className={cx(styles.input, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}
        inputMode="decimal"
        placeholder="0.00"
        variant="simple"
        {...inputCryptoPropsLabel}
        autocomplete="off"
        isDisabled={areInputsDisabled}
        isErrorInlineVisible={false}
        onBlur={() => setIsCryptoInputFocused(false)}
        onChange={e => onCryptoValueChange(e.target.value)}
        onClear={handleClear}
        onFocus={() => setIsCryptoInputFocused(true)}
        shouldAutoFocusAndSelect={isCryptoMainValueDisplay}
      />
      <InputText
        autocomplete="off"
        className={cx(styles.input, !isCryptoMainValueDisplay && styles.isFiatMainValueDisplay)}
        inputMode="decimal"
        isDisabled={areInputsDisabled}
        isErrorInlineVisible={false}
        onBlur={() => setIsFiatInputFocused(false)}
        onChange={e => onFiatValueChange(e.target.value)}
        onClear={handleClear}
        onFocus={() => setIsFiatInputFocused(true)}
        placeholder="0.00"
        suffix={displayCurrency.toUpperCase()}
        value={fiat}
        {...inputFiatPropsLabel}
        shouldAutoFocusAndSelect={!isCryptoMainValueDisplay}
      />
    </div>
  );
};

export default InputsCryptoFiat;
