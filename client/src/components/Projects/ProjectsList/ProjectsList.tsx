import cx from 'classnames';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectsListItem from 'components/Projects/ProjectsListItem';
import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem';
import useEpochDurationLabel from 'hooks/helpers/useEpochDurationLabel';
import useProjectsContract from 'hooks/queries/useProjectsContract';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';

import styles from './ProjectsList.module.scss';
import ProposalsListProps from './types';

const ProjectsList: FC<ProposalsListProps> = ({
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
  epoch,
  isFirstArchive,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectsList',
  });

  const { data: projectsAddresses } = useProjectsContract(epoch);
  const { data: proposalsIpfsWithRewards, isFetching: isFetchingProposalsWithRewards } =
    useProposalsIpfsWithRewards(epoch);
  const epochDurationLabel = useEpochDurationLabel(epoch);

  return (
    <div
      className={styles.list}
      data-test={epoch ? 'ProposalsView__ProjectsList--archive' : 'ProposalsView__ProjectsList'}
    >
      {epoch && (
        <>
          {areCurrentEpochsProjectsHiddenOutsideAllocationWindow && isFirstArchive ? null : (
            <div className={styles.divider} />
          )}
          <div
            className={styles.epochArchive}
            data-test="ProposalsView__ProjectsList__header--archive"
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
      {proposalsIpfsWithRewards.length > 0 && !isFetchingProposalsWithRewards
        ? proposalsIpfsWithRewards.map((proposalIpfsWithRewards, index) => (
            <ProjectsListItem
              key={proposalIpfsWithRewards.address}
              className={styles.element}
              dataTest={
                epoch
                  ? `ProposalsView__ProjectsListItem--archive--${index}`
                  : `ProposalsView__ProjectsListItem--${index}`
              }
              epoch={epoch}
              proposalIpfsWithRewards={proposalIpfsWithRewards}
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
