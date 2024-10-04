import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectsListItem from 'components/Projects/ProjectsListItem';
import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem';
import Grid from 'components/shared/Grid';
import Img from 'components/ui/Img';
import useSortedProjects from 'hooks/helpers/useIdsInAllocation/useSortedProjects';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import styles from './ProjectsSearchResults.module.scss';
import ProjectsSearchResultsProps from './types';

const ProjectsSearchResults: FC<ProjectsSearchResultsProps> = ({
  orderOption,
  projectsIpfsWithRewardsAndEpochs,
  isLoading,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectsSearchResults',
  });

  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const projectsIpfsWithRewardsSorted = useSortedProjects(
    projectsIpfsWithRewardsAndEpochs,
    orderOption,
  );

  return (
    <div className={styles.list}>
      {projectsIpfsWithRewardsAndEpochs.length === 0 && !isLoading && (
        <div className={styles.noSearchResults}>
          <Img
            className={styles.image}
            dataTest="ProjectsList__noSearchResults__Img"
            src="images/swept.webp"
          />
          {t('noSearchResults')}
        </div>
      )}
      <Grid>
        {projectsIpfsWithRewardsAndEpochs.length > 0 &&
          !isLoading &&
          projectsIpfsWithRewardsSorted.map((projectIpfsWithRewards, index) => (
            <ProjectsListItem
              key={`${projectIpfsWithRewards.address}--${projectIpfsWithRewards.epoch}`}
              dataTest={
                projectIpfsWithRewards.epoch
                  ? `ProjectsView__ProjectsListItem--archive--${index}`
                  : `ProjectsView__ProjectsListItem--${index}`
              }
              epoch={projectIpfsWithRewards.epoch}
              projectIpfsWithRewards={projectIpfsWithRewards}
              searchResultsLabel={
                isDecisionWindowOpen && currentEpoch === projectIpfsWithRewards.epoch
                  ? ''
                  : t('searchResultsLabel', { epochNumber: projectIpfsWithRewards.epoch })
              }
            />
          ))}
        {isLoading &&
          [...Array(5).keys()].map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProjectsListSkeletonItem key={index} className={styles.element} />
          ))}
      </Grid>
    </div>
  );
};

export default memo(ProjectsSearchResults);
