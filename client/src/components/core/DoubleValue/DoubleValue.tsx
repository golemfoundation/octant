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
  textAlignment = 'left',
  valueCrypto,
  valueString,
  variant = 'standard',
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
    cryptoCurrency,
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay,
    valueCrypto,
    valueString,
  });

  return (
    <div className={cx(styles.root, styles[`textAlignment--${textAlignment}`], className)}>
      <div className={cx(styles.primary, styles[`variant--${variant}`])}>{values.primary}</div>
      {values.secondary && <div className={styles.secondary}>{values.secondary}</div>}
    </div>
  );
};

export default DoubleValue;
