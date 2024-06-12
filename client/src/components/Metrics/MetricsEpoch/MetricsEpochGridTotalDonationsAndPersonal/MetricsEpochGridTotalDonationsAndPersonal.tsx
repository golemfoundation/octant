import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import MetricsEpochGridTotalDonationsAndPersonalProps from './types';

const MetricsEpochGridTotalDonationsAndPersonal: FC<
  MetricsEpochGridTotalDonationsAndPersonalProps
> = ({ isLoading, totalUserDonationsWithPatronRewards, totalPersonal, className }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const getValuesToDisplay = useGetValuesToDisplay();

  const totalUserDonationWithPatronRewardsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalUserDonationsWithPatronRewards,
  });

  const totalPersonalValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalPersonal,
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridTotalDonationsAndPersonal"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalUserDonationWithPatronRewardsValues.secondary}
              value={totalUserDonationWithPatronRewardsValues.primary}
            />
          ),
          title: t('totalDonations'),
        },
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalPersonalValues.secondary}
              value={totalPersonalValues.primary}
            />
          ),
          title: t('totalPersonal'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsEpochGridTotalDonationsAndPersonal;
