import cx from 'classnames';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectsListItem from 'components/Projects/ProjectsListItem';
import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem';
import Grid from 'components/shared/Grid';
import useEpochDurationLabel from 'hooks/helpers/useEpochDurationLabel';
import useSortedProjects from 'hooks/helpers/useIdsInAllocation/useSortedProjects';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useProjectsIpfsWithRewards from 'hooks/queries/useProjectsIpfsWithRewards';

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

  const projectsIpfsWithRewardsSorted = useSortedProjects(projectsIpfsWithRewards, orderOption);

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
              dataTest={
                epoch
                  ? `ProjectsView__ProjectsListItem--archive--${index}`
                  : `ProjectsView__ProjectsListItem--${index}`
              }
              epoch={epoch}
              isAnchorForTourguide={
                projectsIpfsWithRewardsSorted.length > 4 ? index === 5 : index === 0
              }
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
