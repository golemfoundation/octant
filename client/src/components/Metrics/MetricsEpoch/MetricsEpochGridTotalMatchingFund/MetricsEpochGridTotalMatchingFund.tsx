import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import MetricsEpochGridTotalMatchingFundProps from './types';

const MetricsEpochGridTotalMatchingFund: FC<MetricsEpochGridTotalMatchingFundProps> = ({
  isLoading,
  matchingFund,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const getValuesToDisplay = useGetValuesToDisplay();

  const totalMatchingFundToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: matchingFund,
    getFormattedEthValueProps: {
      maxNumberOfDigitsToShow: 6,
    },
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridTotalMatchingFund"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalMatchingFundToDisplay.secondary}
              value={totalMatchingFundToDisplay.primary}
            />
          ),
          title: t('totalMatching'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsEpochGridTotalMatchingFund;
