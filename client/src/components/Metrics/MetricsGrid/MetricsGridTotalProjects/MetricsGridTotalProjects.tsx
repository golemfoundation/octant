import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useAllProposals from 'hooks/queries/useAllProposals';
import useProposalsContract from 'hooks/queries/useProposalsContract';

import MetricsGridTotalProjectsProps from './types';

const MetricsGridTotalProjects: FC<MetricsGridTotalProjectsProps> = ({ isLoading = false }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { data: allProposals } = useAllProposals();
  const { data: proposalsContract } = useProposalsContract();

  return (
    <MetricsGridTile
      dataTest="MetricsTotalProjects"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              subvalue={t('totalProjectsSinceEpoch0', {
                projectsAmount: allProposals.length,
              })}
              value={proposalsContract?.length.toString() ?? ''}
            />
          ),
          title: t('totalProjects'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsGridTotalProjects;
