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
  const dataTestRoot = 'MetricsEpochGridUnallocatedValue';
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { epoch } = useMetricsEpoch();
  const { data: epochUnusedRewards } = useEpochUnusedRewards(epoch);
  const getValuesToDisplay = useGetValuesToDisplay();

  const unallocatedValue = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: {
      maxNumberOfDigitsToShow: 6,
    },
    showCryptoSuffix: true,
    valueCrypto: epochUnusedRewards?.value,
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest={dataTestRoot}
      groups={[
        {
          children: (
            <MetricsGridTileValue
              dataTest={`${dataTestRoot}__unallocatedValue`}
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
