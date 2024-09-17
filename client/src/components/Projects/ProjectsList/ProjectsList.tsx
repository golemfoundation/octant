import cx from 'classnames';
import React, { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectsListItem from 'components/Projects/ProjectsListItem';
import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem';
import Grid from 'components/shared/Grid';
import { PROJECTS_ADDRESSES_RANDOMIZED_ORDER } from 'constants/localStorageKeys';
import useEpochDurationLabel from 'hooks/helpers/useEpochDurationLabel';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useProjectsIpfsWithRewards from 'hooks/queries/useProjectsIpfsWithRewards';
import { ProjectsAddressesRandomizedOrder } from 'types/localStorage';

import styles from './ProjectsList.module.scss';
import ProjectsListProps from './types';

const ProjectsList: FC<ProjectsListProps> = ({
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
  epoch,
  isFirstArchive,
  orderOption,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectsList',
  });

  const { data: projectsEpoch, isFetching: isFetchingProjectsEpoch } = useProjectsEpoch(epoch);
  const { data: projectsIpfsWithRewards, isFetching: isFetchingProjectsWithRewards } =
    useProjectsIpfsWithRewards(epoch);
  const epochDurationLabel = useEpochDurationLabel(epoch);

  const isLoading = isFetchingProjectsEpoch || isFetchingProjectsWithRewards;

  const projectsIpfsWithRewardsSorted = useMemo(() => {
    switch (orderOption) {
      case 'randomized': {
        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER)!,
        ) as ProjectsAddressesRandomizedOrder;
        return projectsAddressesRandomizedOrder.addressesRandomizedOrder;
      }
      case 'alphabeticalAscending': {
        const projectIpfsWithRewardsFiltered = projectsIpfsWithRewards.filter(
          element => element.name !== undefined,
        );
        return projectIpfsWithRewardsFiltered.sort((a, b) => a.name!.localeCompare(b.name!));
      }
      case 'alphabeticalDescending': {
        const projectIpfsWithRewardsFiltered = projectsIpfsWithRewards.filter(
          element => element.name !== undefined,
        );
        return projectIpfsWithRewardsFiltered.sort((a, b) => b.name!.localeCompare(a.name!));
      }
      case 'donorsAscending': {
        return projectsIpfsWithRewards.sort((a, b) => a.numberOfDonors - b.numberOfDonors);
      }
      case 'donorsDescending': {
        return projectsIpfsWithRewards.sort((a, b) => b.numberOfDonors - a.numberOfDonors);
      }
      case 'totalsAscending': {
        const projectIpfsWithRewardsFiltered = projectsIpfsWithRewards.filter(
          element => element.totalValueOfAllocations !== undefined,
        );
        return projectIpfsWithRewardsFiltered.sort((a, b) =>
          Number(a.totalValueOfAllocations! - b.totalValueOfAllocations!),
        );
      }
      case 'totalsDescending': {
        const projectIpfsWithRewardsFiltered = projectsIpfsWithRewards.filter(
          element => element.totalValueOfAllocations !== undefined,
        );
        return projectIpfsWithRewardsFiltered.sort((a, b) =>
          Number(b.totalValueOfAllocations! - a.totalValueOfAllocations!),
        );
      }
      default: {
        return projectsIpfsWithRewards;
      }
    }
  }, [projectsIpfsWithRewards, orderOption]);

  return (
    <div
      className={styles.list}
      data-isloading={isLoading ? 'true' : 'false'}
      data-test={epoch ? 'ProjectsView__ProjectsList--archive' : 'ProjectsView__ProjectsList'}
    >
      {epoch && (
        <>
          {areCurrentEpochsProjectsHiddenOutsideAllocationWindow && isFirstArchive ? null : (
            <div className={styles.divider} />
          )}
          <div
            className={styles.epochArchive}
            data-test="ProjectsView__ProjectsList__header--archive"
          >
            {t('epochArchive', { epoch })}
            <span
              className={cx(
                styles.epochDurationLabel,
                epochDurationLabel === '' && styles.isFetching,
              )}
            >
              {epochDurationLabel}
            </span>
          </div>
        </>
      )}
      <Grid>
        {projectsIpfsWithRewards.length > 0 && !isFetchingProjectsWithRewards
          ? projectsIpfsWithRewardsSorted.map((projectIpfsWithRewards, index) => (
              <ProjectsListItem
                key={projectIpfsWithRewards.address}
                className={styles.element}
                dataTest={
                  epoch
                    ? `ProjectsView__ProjectsListItem--archive--${index}`
                    : `ProjectsView__ProjectsListItem--${index}`
                }
                epoch={epoch}
                projectIpfsWithRewards={projectIpfsWithRewards}
              />
            ))
          : projectsEpoch?.projectsAddresses?.map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProjectsListSkeletonItem key={index} className={styles.element} />
            ))}
      </Grid>
    </div>
  );
};

export default memo(ProjectsList);
