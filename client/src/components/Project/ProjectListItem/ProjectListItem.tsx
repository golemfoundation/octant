import React, { FC, Fragment, memo, useMemo } from 'react';

import ProjectDonors from 'components/Project/ProjectDonors';
import ProjectListItemHeader from 'components/Project/ProjectListItemHeader';
import Rewards from 'components/shared/RewardsWithThreshold';
import Description from 'components/ui/Description';
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
  totalValueOfAllocations,
  numberOfDonors,
}) => {
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
        <Rewards
          address={address}
          className={styles.projectRewards}
          epoch={epoch}
          isProjectView
          numberOfDonors={numberOfDonors}
          totalValueOfAllocations={totalValueOfAllocations}
        />
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

export default memo(ProjectListItem);
