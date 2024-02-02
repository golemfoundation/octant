import cx from 'classnames';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsProjectsList from 'components/Metrics/MetricsProjectsList';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';

import styles from './MetricsEpochGridTopProjects.module.scss';
import MetricsEpochGridTopProjectsProps from './types';

const MetricsEpochGridTopProjects: FC<MetricsEpochGridTopProjectsProps> = ({
  isLoading,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch, lastEpoch } = useMetricsEpoch();
  const { isDesktop } = useMediaQuery();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: proposalsIpfsWithRewards } = useProposalsIpfsWithRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );

  const numberOfProjects = isDesktop ? 10 : 5;

  const projects =
    proposalsIpfsWithRewards
      .slice(0, numberOfProjects)
      .map(({ totalValueOfAllocations, ...rest }) => ({
        value: totalValueOfAllocations!,
        ...rest,
      })) || [];

  return (
    <MetricsGridTile
      className={cx(styles.root, className)}
      dataTest="MetricsEpochGridTopProjects"
      groups={[
        {
          children: (
            <MetricsProjectsList
              isLoading={isLoading}
              numberOfSkeletons={numberOfProjects}
              projects={projects}
            />
          ),
          title: t('topProjectsByEthRaised', { numberOfProjects }),
          titleSuffix: <div className={styles.numberOfAllocationsSuffix}>{projects.length}</div>,
        },
      ]}
      size="custom"
    />
  );
};

export default memo(MetricsEpochGridTopProjects);
