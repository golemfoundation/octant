import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import { getValuesToDisplay } from 'components/ui/DoubleValue/utils';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useWithdrawals from 'hooks/queries/useWithdrawals';
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
  const { data: individualReward } = useIndividualReward();
  const { data: withdrawals } = useWithdrawals();

  const totalRewardsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: individualReward,
  });

  const totalWithdrawalsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: withdrawals?.sums.available,
  });

  return (
    <MetricsGridTile
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalRewardsValues.secondary}
              value={totalRewardsValues.primary}
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
