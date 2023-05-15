import cx from 'classnames';
import React, { FC, useEffect, useState } from 'react';

import InputText from 'components/core/InputText/InputText';
import InputTextProps from 'components/core/InputText/types';
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

  const inputCryptoPropsLabel = isCryptoMainValueDisplay
    ? { ...inputCryptoProps, error, isErrorInlineVisible: false, label }
    : { ...inputCryptoProps, error };
  const inputFiatPropsLabel = isCryptoMainValueDisplay
    ? { error }
    : { error, isErrorInlineVisible: false, label };

  const cryptoFiatRatio = cryptoValues?.[cryptoCurrency][displayCurrency || 'usd'] || 1;

  const handleFiatChange: InputTextProps['onChange'] = event => {
    const valueComma = event.target.value.replace(comma, '.');

    if (valueComma && !floatNumberWithUpTo2DecimalPlaces.test(valueComma)) {
      return;
    }

    const fiatToCrypto = valueComma ? (parseFloat(valueComma) / cryptoFiatRatio).toFixed(18) : '';
    setFiat(valueComma);
    inputCryptoProps.onChange(fiatToCrypto);
  };

  const handleCryptoChange: InputTextProps['onChange'] = event => {
    const valueComma = event.target.value.replace(comma, '.');

    if (valueComma && !floatNumberWithUpTo18DecimalPlaces.test(valueComma)) {
      return;
    }

    const cryptoToFiat = valueComma ? (parseFloat(valueComma) * cryptoFiatRatio).toFixed(2) : '';

    setFiat(cryptoToFiat);
    inputCryptoProps.onChange(valueComma);
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

  return (
    <div className={cx(styles.root, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}>
      <InputText
        className={cx(styles.input, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}
        inputMode="decimal"
        placeholder="0.00"
        variant="simple"
        {...inputCryptoPropsLabel}
        onChange={handleCryptoChange}
        onClear={handleClear}
      />
      <InputText
        className={cx(styles.input, !isCryptoMainValueDisplay && styles.isFiatMainValueDisplay)}
        inputMode="decimal"
        onChange={handleFiatChange}
        onClear={handleClear}
        placeholder="0.00"
        suffix={displayCurrency?.toUpperCase() || 'USD'}
        value={fiat}
        variant="simple"
        {...inputFiatPropsLabel}
      />
    </div>
  );
};

export default InputsCryptoFiat;
