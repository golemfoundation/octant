import React, { FC, Fragment, useMemo } from 'react';

import ProjectListItemButtonsWebsiteAndShare from 'components/Project/ProjectListItemButtonsWebsiteAndShare';
import ProjectListItemHeader from 'components/Project/ProjectListItemHeader';
// import ProjectMilestones from 'components/Project/ProjectMilestones';
import Rewards from 'components/shared/Rewards';
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
  const matchedRewards = projectIpfsWithRewards?.matchedRewards || 0n;
  const donations = projectIpfsWithRewards?.donations || 0n;
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
        {!isEpoch1 && (
          <Rewards
            address={address}
            className={styles.projectRewards}
            donations={donations}
            epoch={epoch}
            matchedRewards={matchedRewards}
            numberOfDonors={numberOfDonors}
            showMoreInfo
            totalValueOfAllocations={totalValueOfAllocations}
            variant="projectView"
          />
        )}
        <Description
          className={styles.description}
          dataTest="ProjectListItem__Description"
          innerHtml={decodedDescription}
          variant="big"
        />
        <ProjectListItemButtonsWebsiteAndShare
          address={address}
          className={styles.buttonsWebsiteAndShare}
          name={name}
          website={website}
        />
      </div>
      {/* <ProjectMilestones projectAddress={address} /> */}
    </Fragment>
  );
};

export default ProjectListItem;
