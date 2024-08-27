import React, { FC, Fragment, useMemo } from 'react';

import ProjectDonors from 'components/Project/ProjectDonors';
import ProjectListItemHeader from 'components/Project/ProjectListItemHeader';
import RewardsWithoutThreshold from 'components/shared/RewardsWithoutThreshold';
import RewardsWithThreshold from 'components/shared/RewardsWithThreshold';
import Description from 'components/ui/Description';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useProjectsIpfsWithRewards from 'hooks/queries/useProjectsIpfsWithRewards';
import decodeBase64ToUtf8 from 'utils/decodeBase64ToUtf8';

import styles from './ProjectListItem.module.scss';
import ProjectListItemProps from './types';

const ProjectListItem: FC<ProjectListItemProps> = ({
  address,
  name,
  description,
  profileImageSmall,
  website,
  index,
  epoch,
}) => {
  const { data: projectsIpfsWithRewards } = useProjectsIpfsWithRewards(epoch);
  const projectIpfsWithRewards = projectsIpfsWithRewards.find(p => p.address === address);
  // loadedProjects (ProjectView) aren't updated during changes in open AW
  // to provide live updates, the following values are taken directly from projectsIpfsWithRewards
  const numberOfDonors = projectIpfsWithRewards?.numberOfDonors || 0;
  const totalValueOfAllocations = projectIpfsWithRewards?.totalValueOfAllocations || 0n;
  const { data: currentEpoch } = useCurrentEpoch();
  const isEpoch1 = currentEpoch === 1;

  const decodedDescription = useMemo(() => decodeBase64ToUtf8(description!), [description]);

  return (
    <Fragment>
      <div className={styles.root} data-index={index} data-test="ProjectListItem">
        <ProjectListItemHeader
          address={address}
          epoch={epoch}
          name={name}
          profileImageSmall={profileImageSmall}
          website={website}
        />
        {!isEpoch1 && epoch && epoch < 4 && (
          <RewardsWithThreshold
            address={address}
            className={styles.projectRewards}
            epoch={epoch}
            isProjectView
            numberOfDonors={numberOfDonors}
            totalValueOfAllocations={totalValueOfAllocations}
          />
        )}
        {!isEpoch1 && (!epoch || epoch >= 4) && (
          <RewardsWithoutThreshold
            className={styles.projectRewards}
            epoch={epoch}
            numberOfDonors={numberOfDonors}
            totalValueOfAllocations={totalValueOfAllocations}
          />
        )}
        <Description
          dataTest="ProjectListItem__Description"
          innerHtml={decodedDescription}
          variant="big"
        />
      </div>
      <ProjectDonors dataTest="ProjectListItem__Donors" projectAddress={address} />
    </Fragment>
  );
};

export default ProjectListItem;
