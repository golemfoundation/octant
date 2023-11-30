import { formatUnits } from 'ethers/lib/utils';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/common/MetricsGridTile/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/common/MetricsGridTileValue/MetricsGridTileValue';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useLargestLockedAmount from 'hooks/subgraph/useLargestLockedAmount';
import useSettingsStore from 'store/settings/store';
import getFormattedValueWithSymbolSuffix from 'utils/getFormattedValueWithSymbolSuffix';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

import MetricsLargestGlmLockProps from './types';

const MetricsLargestGlmLock: FC<MetricsLargestGlmLockProps> = ({ isLoading = false }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data: largestLockedAmount } = useLargestLockedAmount();
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);

  const largestLockedAmountValue = useMemo(() => {
    if (!largestLockedAmount) {
      return '';
    }

    const largestLockedAmountInt = parseInt(formatUnits(largestLockedAmount), 10);

    return getFormattedValueWithSymbolSuffix({
      format: 'thousandsAndMillions',
      value: largestLockedAmountInt,
    });
  }, [largestLockedAmount]);

  const largestLockedAmountFiatValue = getValueFiatToDisplay({
    cryptoCurrency: 'golem',
    cryptoValues,
    displayCurrency,
    error,
    isUsingHairSpace: false,
    valueCrypto: largestLockedAmount,
  });

  return (
    <MetricsGridTile
      dataTest="MetricsLargestGlmLock"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              subvalue={largestLockedAmountFiatValue}
              value={largestLockedAmountValue}
            />
          ),
          title: t('largestGlmLock'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsLargestGlmLock;
