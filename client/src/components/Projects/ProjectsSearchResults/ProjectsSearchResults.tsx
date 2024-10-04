import React, { FC, memo } from 'react';

import ProjectsListItem from 'components/Projects/ProjectsListItem';
import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem';
import Grid from 'components/shared/Grid';
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
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const projectsIpfsWithRewardsSorted = useSortedProjects(
    projectsIpfsWithRewardsAndEpochs,
    orderOption,
  );

  return (
    <div className={styles.list}>
      <Grid>
        {projectsIpfsWithRewardsAndEpochs.length > 0 && !isLoading
          ? projectsIpfsWithRewardsSorted.map((projectIpfsWithRewards, index) => (
              <ProjectsListItem
                key={`${projectIpfsWithRewards.address}--${projectIpfsWithRewards.epoch}`}
                className={styles.element}
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
                    : `Epoch ${projectIpfsWithRewards.epoch}`
                }
              />
            ))
          : [...Array(5).keys()].map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProjectsListSkeletonItem key={index} className={styles.element} />
            ))}
      </Grid>
    </div>
  );
};

export default memo(ProjectsSearchResults);
