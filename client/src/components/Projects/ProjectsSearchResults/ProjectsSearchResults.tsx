import React, { FC, memo, useMemo } from 'react';

import ProjectsListItem from 'components/Projects/ProjectsListItem';
import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem';
import Grid from 'components/shared/Grid';
import { PROJECTS_ADDRESSES_RANDOMIZED_ORDER } from 'constants/localStorageKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { ProjectsAddressesRandomizedOrder } from 'types/localStorage';

import styles from './ProjectsSearchResults.module.scss';
import ProjectsSearchResultsProps from './types';

const ProjectsSearchResults: FC<ProjectsSearchResultsProps> = ({
  orderOption,
  projectsIpfsWithRewardsAndEpochs,
  isLoading,
}) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const projectsIpfsWithRewardsSorted =
    useMemo((): ProjectsSearchResultsProps['projectsIpfsWithRewardsAndEpochs'] => {
      switch (orderOption) {
        case 'randomized': {
          const projectsAddressesRandomizedOrder = JSON.parse(
            localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER)!,
          ) as ProjectsAddressesRandomizedOrder;

          const { addressesRandomizedOrder } = projectsAddressesRandomizedOrder;

          return projectsIpfsWithRewardsAndEpochs.sort((a, b) => {
            return (
              addressesRandomizedOrder.indexOf(a.address) -
              addressesRandomizedOrder.indexOf(b.address)
            );
          });
        }
        case 'alphabeticalAscending': {
          const projectIpfsWithRewardsFiltered = projectsIpfsWithRewardsAndEpochs.filter(
            element => element.name !== undefined,
          );
          return projectIpfsWithRewardsFiltered.sort((a, b) => a.name!.localeCompare(b.name!));
        }
        case 'alphabeticalDescending': {
          const projectIpfsWithRewardsFiltered = projectsIpfsWithRewardsAndEpochs.filter(
            element => element.name !== undefined,
          );
          return projectIpfsWithRewardsFiltered.sort((a, b) => b.name!.localeCompare(a.name!));
        }
        case 'donorsAscending': {
          return projectsIpfsWithRewardsAndEpochs.sort(
            (a, b) => a.numberOfDonors - b.numberOfDonors,
          );
        }
        case 'donorsDescending': {
          return projectsIpfsWithRewardsAndEpochs.sort(
            (a, b) => b.numberOfDonors - a.numberOfDonors,
          );
        }
        case 'totalsAscending': {
          const projectIpfsWithRewardsFiltered = projectsIpfsWithRewardsAndEpochs.filter(
            element => element.totalValueOfAllocations !== undefined,
          );
          return projectIpfsWithRewardsFiltered.sort((a, b) =>
            Number(a.totalValueOfAllocations! - b.totalValueOfAllocations!),
          );
        }
        case 'totalsDescending': {
          const projectIpfsWithRewardsFiltered = projectsIpfsWithRewardsAndEpochs.filter(
            element => element.totalValueOfAllocations !== undefined,
          );
          return projectIpfsWithRewardsFiltered.sort((a, b) =>
            Number(b.totalValueOfAllocations! - a.totalValueOfAllocations!),
          );
        }
        default: {
          return projectsIpfsWithRewardsAndEpochs;
        }
      }
    }, [projectsIpfsWithRewardsAndEpochs, orderOption]);

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
