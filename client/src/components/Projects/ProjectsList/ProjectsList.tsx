import cx from 'classnames';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectsListItem from 'components/Projects/ProjectsListItem';
import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem';
import useEpochDurationLabel from 'hooks/helpers/useEpochDurationLabel';
import useProjectsContract from 'hooks/queries/useProjectsContract';
import useProjectsIpfsWithRewards from 'hooks/queries/useProjectsIpfsWithRewards';

import styles from './ProjectsList.module.scss';
import ProjectsListProps from './types';

const ProjectsList: FC<ProjectsListProps> = ({
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
  epoch,
  isFirstArchive,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectsList',
  });

  const { data: projectsAddresses } = useProjectsContract(epoch);
  const { data: projectsIpfsWithRewards, isFetching: isFetchingProjectsWithRewards } =
    useProjectsIpfsWithRewards(epoch);
  const epochDurationLabel = useEpochDurationLabel(epoch);

  return (
    <div
      className={styles.list}
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
      {projectsIpfsWithRewards.length > 0 && !isFetchingProjectsWithRewards
        ? projectsIpfsWithRewards.map((projectIpfsWithRewards, index) => (
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
        : projectsAddresses?.map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProjectsListSkeletonItem key={index} className={styles.element} />
          ))}
    </div>
  );
};

export default memo(ProjectsList);
