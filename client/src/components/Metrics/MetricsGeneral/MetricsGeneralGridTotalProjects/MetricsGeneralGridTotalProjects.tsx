import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useAllProposals from 'hooks/subgraph/useAllProposals';

import styles from './MetricsGeneralGridTotalProjects.module.scss';
import MetricsGeneralGridTotalProjectsProps from './types';

const MetricsGeneralGridTotalProjects: FC<MetricsGeneralGridTotalProjectsProps> = ({
  isLoading = false,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { data: allProposals } = useAllProposals();
  const { data: proposalsContract } = useProposalsContract();

  return (
    <MetricsGridTile
      className={styles.root}
      dataTest="MetricsGeneralGridTotalProjects"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              subvalue={t('totalProjectsSinceEpoch0', {
                projectsAmount: allProposals?.length,
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

export default MetricsGeneralGridTotalProjects;
