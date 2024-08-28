import cx from 'classnames';
import React, { FC, Fragment } from 'react';

import DoubleValueSkeleton from 'components/ui/DoubleValueSkeleton';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import styles from './DoubleValue.module.scss';
import DoubleValueProps from './types';

const DoubleValue: FC<DoubleValueProps> = ({
  className,
  coinPricesServerDowntimeText,
  cryptoCurrency,
  dataTest = 'DoubleValue',
  isDisabled,
  isError,
  textAlignment = 'left',
  valueCrypto,
  valueString,
  variant = 'large',
  isFetching = false,
  getFormattedEthValueProps,
  getFormattedGlmValueProps,
  showCryptoSuffix,
}) => {
  const getValuesToDisplay = useGetValuesToDisplay();

  const values = getValuesToDisplay({
    coinPricesServerDowntimeText,
    cryptoCurrency,
    showCryptoSuffix,
    valueCrypto,
    valueString,
    ...(cryptoCurrency === 'ethereum' ? getFormattedEthValueProps : getFormattedGlmValueProps),
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
        <DoubleValueSkeleton variant={variant} dataTest={`${dataTest}__DoubleValueSkeleton`} />
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
              className={cx(
                styles.secondary,
                isError && styles.isError,
                styles[`variant--${variant}`],
              )}
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
