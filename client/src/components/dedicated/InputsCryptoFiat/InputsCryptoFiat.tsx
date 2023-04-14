import cx from 'classnames';
import React, { FC } from 'react';

import InputText from 'components/core/InputText/InputText';
import useSettingsStore from 'store/settings/store';

import styles from './InputsCryptoFiat.module.scss';
import InputsCryptoFiatProps from './types';

const InputsCryptoFiat: FC<InputsCryptoFiatProps> = ({ label, inputCryptoProps }) => {
  const {
    data: { isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));

  const inputCryptoPropsLabel = isCryptoMainValueDisplay
    ? { ...inputCryptoProps, label }
    : inputCryptoProps;
  const inputFiatPropsLabel = isCryptoMainValueDisplay ? undefined : { label };

  return (
    <div className={cx(styles.root, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}>
      <InputText
        className={styles.input}
        placeholder="0.00"
        variant="simple"
        {...inputCryptoPropsLabel}
      />
      <InputText
        className={styles.input}
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
