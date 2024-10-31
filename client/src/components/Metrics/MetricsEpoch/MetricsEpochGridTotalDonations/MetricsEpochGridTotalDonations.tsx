import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import MetricsEpochGridTotalDonationsProps from './types';

const MetricsEpochGridTotalDonations: FC<MetricsEpochGridTotalDonationsProps> = ({
  isLoading,
  totalUserDonations,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const getValuesToDisplay = useGetValuesToDisplay();

  const totalUserDonationsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: {
      maxNumberOfDigitsToShow: 6,
    },
    showCryptoSuffix: true,
    valueCrypto: totalUserDonations,
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
              subvalue={totalUserDonationsValues.secondary}
              value={totalUserDonationsValues.primary}
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
