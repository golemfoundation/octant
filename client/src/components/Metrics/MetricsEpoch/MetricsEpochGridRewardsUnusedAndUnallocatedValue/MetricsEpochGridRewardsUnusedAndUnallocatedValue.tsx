import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochUnusedRewards from 'hooks/queries/useEpochUnusedRewards';

import MetricsEpochGridRewardsUnusedAndUnallocatedValueProps from './types';

const MetricsEpochGridRewardsUnusedAndUnallocatedValue: FC<
  MetricsEpochGridRewardsUnusedAndUnallocatedValueProps
> = ({ isLoading, className }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { epoch } = useMetricsEpoch();
  const { data: epochUnusedRewards } = useEpochUnusedRewards(epoch);
  const getValuesToDisplay = useGetValuesToDisplay();

  const users = `${epochUnusedRewards?.addresses.length || 0}`;
  const unallocatedValue = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: epochUnusedRewards?.value,
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridRewardsUnusedAndUnallocatedValue"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={t('users').toUpperCase()}
              value={users}
            />
          ),
          title: t('rewardsUnused'),
        },
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={unallocatedValue.secondary}
              value={unallocatedValue.primary}
            />
          ),
          title: t('unallocatedValue'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsEpochGridRewardsUnusedAndUnallocatedValue;
