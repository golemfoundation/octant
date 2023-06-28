import cx from 'classnames';
import React, { FC } from 'react';

import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';

import styles from './DoubleValue.module.scss';
import DoubleValueProps from './types';
import { getValuesToDisplay } from './utils';

const DoubleValue: FC<DoubleValueProps> = ({
  className,
  cryptoCurrency,
  coinPricesServerDowntimeText = 'Conversion offline',
  dataTest = 'DoubleValue',
  textAlignment = 'left',
  isError,
  valueCrypto,
  valueString,
  variant = 'standard',
  isDisabled,
}) => {
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);

  const values = getValuesToDisplay({
    coinPricesServerDowntimeText,
    cryptoCurrency,
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay,
    valueCrypto,
    valueString,
  });

  return (
    <div
      className={cx(
        styles.root,
        isError && styles.isError,
        styles[`textAlignment--${textAlignment}`],
        isDisabled && styles.isDisabled,
        className,
      )}
      data-test={dataTest}
    >
      <div
        className={cx(styles.primary, styles[`variant--${variant}`])}
        data-test={`${dataTest}__primary`}
      >
        {values.primary}
      </div>
      {values.secondary && (
        <div
          className={cx(styles.secondary, isError && styles.isError)}
          data-test={`${dataTest}__secondary`}
        >
          {values.secondary}
        </div>
      )}
    </div>
  );
};

export default DoubleValue;
