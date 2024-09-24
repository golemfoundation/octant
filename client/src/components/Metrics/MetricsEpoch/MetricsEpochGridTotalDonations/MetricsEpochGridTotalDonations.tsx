import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import MetricsEpochGridTotalDonationsProps from './types';

const MetricsEpochGridTotalDonations: FC<MetricsEpochGridTotalDonationsProps> = ({
  isLoading,
  totalUserDonationsWithPatronRewards,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const getValuesToDisplay = useGetValuesToDisplay();

  const totalUserDonationWithPatronRewardsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalUserDonationsWithPatronRewards,
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridTotalDonations"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              dataTest="MetricsEpochGridTotalDonations__MetricsGridTileValue"
              isLoading={isLoading}
              size="S"
              subvalue={totalUserDonationWithPatronRewardsValues.secondary}
              value={totalUserDonationWithPatronRewardsValues.primary}
            />
          ),
          title: t('totalDonations'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsEpochGridTotalDonations;
