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
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch, lastEpoch } = useMetricsEpoch();
  const { isLargeDesktop } = useMediaQuery();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: projectsIpfsWithRewards } = useProjectsIpfsWithRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );

  const projects =
    projectsIpfsWithRewards.map(props => ({
      epoch,
      ...props,
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
              numberOfSkeletons={12}
              projects={projects}
            />
          ),
          title: t('fundingLeaderboard'),
          titleSuffix: isLargeDesktop ? (
            <div className={styles.headers}>
              <div className={styles.label}>{i18n.t('common.donors')}</div>
              <div className={styles.label}>{i18n.t('common.donations')}</div>
              <div className={styles.label}>{i18n.t('common.matchFunding')}</div>
              <div className={styles.label}>{i18n.t('common.total')}</div>
            </div>
          ) : null,
        },
      ]}
      size="custom"
    />
  );
};

export default memo(MetricsEpochGridTopProjects);
