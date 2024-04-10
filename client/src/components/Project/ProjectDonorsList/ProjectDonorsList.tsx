import cx from 'classnames';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import ProjectDonorsListItem from 'components/Project/ProjectDonorsListItem';
import ProjectDonorsListSkeletonItem from 'components/Project/ProjectDonorsListSkeletonItem';
import ProjectDonorsListTotalDonated from 'components/Project/ProjectDonorsListTotalDonated';
import { DONORS_SHORT_LIST_LENGTH } from 'constants/donors';
import useProjectDonors from 'hooks/queries/donors/useProjectDonors';

import styles from './ProjectDonorsList.module.scss';
import ProjectDonorsListProps from './types';

const ProjectDonorsList: FC<ProjectDonorsListProps> = ({
  className,
  dataTest = 'DonorsList',
  projectAddress,
  showFullList = false,
}) => {
  const { epoch } = useParams();
  const { data: projectDonors, isFetching } = useProjectDonors(
    projectAddress,
    parseInt(epoch!, 10),
  );

  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      {isFetching ? (
        [...Array(DONORS_SHORT_LIST_LENGTH)].map((_, idx) => (
          <ProjectDonorsListSkeletonItem
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            dataTest={`${dataTest}__DonorsItemSkeleton`}
          />
        ))
      ) : (
        <>
          <div className={cx(styles.list, showFullList && styles.fullList)}>
            {projectDonors
              ?.slice(0, showFullList ? projectDonors.length : DONORS_SHORT_LIST_LENGTH)
              ?.map(({ amount, address }) => (
                <ProjectDonorsListItem key={address} amount={amount} donorAddress={address} />
              ))}
          </div>
          <ProjectDonorsListTotalDonated
            className={cx(styles.totalDonated, showFullList && styles.fullList)}
            projectDonors={projectDonors}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDonorsList;
