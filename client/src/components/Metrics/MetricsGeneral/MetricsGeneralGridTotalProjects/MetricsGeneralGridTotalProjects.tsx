import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useProjectsContract from 'hooks/queries/useProjectsContract';
import useAllProjects from 'hooks/subgraph/useAllProjects';

import styles from './MetricsGeneralGridTotalProjects.module.scss';
import MetricsGeneralGridTotalProjectsProps from './types';

const MetricsGeneralGridTotalProjects: FC<MetricsGeneralGridTotalProjectsProps> = ({
  isLoading = false,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { data: allProjects } = useAllProjects();
  const { data: projectsContract } = useProjectsContract();

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
                projectsAmount: allProjects?.length,
              })}
              value={projectsContract?.length.toString() ?? ''}
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
