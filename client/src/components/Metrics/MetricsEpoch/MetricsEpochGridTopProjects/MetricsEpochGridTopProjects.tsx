import cx from 'classnames';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsProjectsList from 'components/Metrics/MetricsProjectsList';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectsIpfsWithRewards from 'hooks/queries/useProjectsIpfsWithRewards';

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
  const { data: projectsIpfsWithRewards } = useProjectsIpfsWithRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );

  const numberOfProjects = isDesktop ? 10 : 5;

  const projects =
    projectsIpfsWithRewards
      .slice(0, numberOfProjects)
      .map(({ totalValueOfAllocations, ...rest }) => ({
        epoch,
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
              dataTest="MetricsEpochGridTopProjects__list"
              isLoading={isLoading}
              numberOfSkeletons={numberOfProjects}
              projects={projects}
            />
          ),
          title: t('topProjectsByEthRaised', { numberOfProjects }),
        },
      ]}
      size="custom"
    />
  );
};

export default memo(MetricsEpochGridTopProjects);
