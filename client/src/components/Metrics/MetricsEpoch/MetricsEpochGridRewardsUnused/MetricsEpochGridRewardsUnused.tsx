import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochUnusedRewards from 'hooks/queries/useEpochUnusedRewards';

import MetricsEpochGridRewardsUnusedProps from './types';

const MetricsEpochGridRewardsUnused: FC<MetricsEpochGridRewardsUnusedProps> = ({
  isLoading,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { epoch } = useMetricsEpoch();
  const { data: epochUnusedRewards } = useEpochUnusedRewards(epoch);

  const users = `${epochUnusedRewards?.addresses.length || 0}`;

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridRewardsUnused"
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
      ]}
      size="S"
    />
  );
};

export default MetricsEpochGridRewardsUnused;
