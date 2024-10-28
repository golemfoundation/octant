import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochUnusedRewards from 'hooks/queries/useEpochUnusedRewards';

import MetricsEpochGridUnallocatedValueProps from './types';

const MetricsEpochGridUnallocatedValue: FC<MetricsEpochGridUnallocatedValueProps> = ({
  isLoading,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { epoch } = useMetricsEpoch();
  const { data: epochUnusedRewards } = useEpochUnusedRewards(epoch);
  const getValuesToDisplay = useGetValuesToDisplay();

  const unallocatedValue = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: epochUnusedRewards?.value,
    getFormattedEthValueProps: {
      maxNumberOfDigitsToShow: 6,
    },
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridUnallocatedValue"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              dataTest="MetricsEpochGridUnallocatedValue"
              isLoading={isLoading}
              size="S"
              subvalue={unallocatedValue.secondary}
              value={unallocatedValue.primary}
            />
          ),
          title: t('unallocatedValue'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsEpochGridUnallocatedValue;
