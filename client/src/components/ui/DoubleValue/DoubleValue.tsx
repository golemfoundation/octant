import cx from 'classnames';
import React, { FC, Fragment } from 'react';

import DoubleValueSkeleton from 'components/ui/DoubleValueSkeleton';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';

import styles from './DoubleValue.module.scss';
import DoubleValueProps from './types';
import { getValuesToDisplay } from './utils';

const DoubleValue: FC<DoubleValueProps> = ({
  className,
  coinPricesServerDowntimeText = 'Conversion offline',
  cryptoCurrency,
  dataTest = 'DoubleValue',
  isDisabled,
  isError,
  textAlignment = 'left',
  valueCrypto,
  valueString,
  variant = 'big',
  isFetching = false,
  shouldIgnoreGwei,
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
    shouldIgnoreGwei,
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
      {isFetching ? (
        <DoubleValueSkeleton />
      ) : (
        <Fragment>
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
        </Fragment>
      )}
    </div>
  );
};

export default DoubleValue;
