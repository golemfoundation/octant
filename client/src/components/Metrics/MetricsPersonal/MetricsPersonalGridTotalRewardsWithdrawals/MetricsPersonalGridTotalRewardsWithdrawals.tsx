import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useMetricsPersonalDataRewardsUsage from 'hooks/helpers/useMetricsPersonalDataRewardsUsage';

import MetricsPersonalGridTotalRewardsWithdrawalsProps from './types';

const MetricsPersonalGridTotalRewardsWithdrawals: FC<
  MetricsPersonalGridTotalRewardsWithdrawalsProps
> = ({ isLoading }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data: metricsPersonalDataRewardsUsage } = useMetricsPersonalDataRewardsUsage();
  const getValuesToDisplay = useGetValuesToDisplay();

  const totalRewardsUsedValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: metricsPersonalDataRewardsUsage?.totalRewardsUsed,
  });

  const totalWithdrawalsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
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
