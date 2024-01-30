import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochLeverage from 'hooks/queries/useEpochLeverage';

import MetricsEpochGridAverageLeverageProps from './types';

const MetricsEpochGridAverageLeverage: FC<MetricsEpochGridAverageLeverageProps> = ({
  isLoading = false,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch } = useMetricsEpoch();
  const { data: epochLeverage } = useEpochLeverage(epoch);

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridAverageLeverage"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              showSubvalueLoader={false}
              value={`${epochLeverage?.toFixed(0)}x`}
            />
          ),
          title: t('averageLeverage'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsEpochGridAverageLeverage;
