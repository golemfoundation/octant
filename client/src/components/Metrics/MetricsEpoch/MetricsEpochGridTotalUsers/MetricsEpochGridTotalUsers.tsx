import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochBudgets from 'hooks/queries/useEpochBudgets';

import MetricsEpochGridTotalUsersProps from './types';

const MetricsEpochGridTotalUsers: FC<MetricsEpochGridTotalUsersProps> = ({
  isLoading = false,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch } = useMetricsEpoch();
  const { data: epochBudgets } = useEpochBudgets(epoch);

  const totalUsers = epochBudgets?.budgets.filter(({ budget }) => !budget.isZero()).length || 0;

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridTotalUsers"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              showSubvalueLoader={false}
              value={totalUsers.toString()}
            />
          ),
          title: t('totalUsers'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsEpochGridTotalUsers;
