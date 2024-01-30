import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import { getValuesToDisplay } from 'components/ui/DoubleValue/utils';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useEpochUnusedRewards from 'hooks/queries/useEpochUnusedRewards';
import useSettingsStore from 'store/settings/store';

import MetricsEpochGridRewardsUnusedAndUnallocatedValueProps from './types';

const MetricsEpochGridRewardsUnusedAndUnallocatedValue: FC<
  MetricsEpochGridRewardsUnusedAndUnallocatedValueProps
> = ({ isLoading, className }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { epoch } = useMetricsEpoch();
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const { data: epochUnusedRewards } = useEpochUnusedRewards(epoch);

  const users = `${epochUnusedRewards?.addresses.length || 0}`;
  const unallocatedValue = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
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
