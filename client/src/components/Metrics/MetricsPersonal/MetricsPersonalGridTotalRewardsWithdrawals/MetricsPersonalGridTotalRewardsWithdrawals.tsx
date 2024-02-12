import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import { getValuesToDisplay } from 'components/ui/DoubleValue/utils';
import useMetricsPersonalDataRewardsUsage from 'hooks/helpers/useMetricsPersonalDataRewardsUsage';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';

import MetricsPersonalGridTotalRewardsWithdrawalsProps from './types';

const MetricsPersonalGridTotalRewardsWithdrawals: FC<
  MetricsPersonalGridTotalRewardsWithdrawalsProps
> = ({ isLoading }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const { data: metricsPersonalDataRewardsUsage } = useMetricsPersonalDataRewardsUsage();

  const totalRewardsUsedValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: metricsPersonalDataRewardsUsage?.totalRewardsUsed,
  });

  const totalWithdrawalsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: metricsPersonalDataRewardsUsage?.totalWithdrawals,
  });

  return (
    <MetricsGridTile
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalRewardsUsedValues.secondary}
              value={totalRewardsUsedValues.primary}
            />
          ),
          title: t('totalRewards'),
        },
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalWithdrawalsValues.secondary}
              value={totalWithdrawalsValues.primary}
            />
          ),
          title: t('totalWithdrawals'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsPersonalGridTotalRewardsWithdrawals;
