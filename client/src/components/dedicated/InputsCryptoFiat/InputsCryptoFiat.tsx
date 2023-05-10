import cx from 'classnames';
import React, { FC } from 'react';

import InputText from 'components/core/InputText/InputText';
import useSettingsStore from 'store/settings/store';

import styles from './InputsCryptoFiat.module.scss';
import InputsCryptoFiatProps from './types';

const InputsCryptoFiat: FC<InputsCryptoFiatProps> = ({ error, label, inputCryptoProps }) => {
  const {
    data: { isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));

  const inputCryptoPropsLabel = isCryptoMainValueDisplay
    ? { ...inputCryptoProps, error, isErrorInlineVisible: false, label }
    : { ...inputCryptoProps, error };
  const inputFiatPropsLabel = isCryptoMainValueDisplay
    ? { error }
    : { error, isErrorInlineVisible: false, label };

  return (
    <div className={cx(styles.root, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}>
      <InputText
        className={cx(styles.input, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}
        inputMode="decimal"
        placeholder="0.00"
        variant="simple"
        {...inputCryptoPropsLabel}
      />
      <InputText
        className={cx(styles.input, !isCryptoMainValueDisplay && styles.isFiatMainValueDisplay)}
        inputMode="decimal"
        isDisabled
        placeholder="0.00"
        suffix="USD"
        variant="simple"
        {...inputFiatPropsLabel}
      />
    </div>
  );
};

export default InputsCryptoFiat;
