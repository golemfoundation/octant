import React, { FC, Fragment, memo, useMemo } from 'react';

import ProjectDonors from 'components/Project/ProjectDonors';
import ProjectListItemHeader from 'components/Project/ProjectListItemHeader';
import Rewards from 'components/shared/Rewards';
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
      <div className={styles.proposal} data-index={index} data-test="ProposalListItem">
        <ProjectListItemHeader
          address={address}
          epoch={epoch}
          name={name}
          profileImageSmall={profileImageSmall}
          website={website}
        />
        <Rewards
          address={address}
          className={styles.proposalRewards}
          epoch={epoch}
          isProposalView
          numberOfDonors={numberOfDonors}
          totalValueOfAllocations={totalValueOfAllocations}
        />
        <Description
          dataTest="ProposalListItem__Description"
          innerHtml={decodedDescription}
          variant="big"
        />
      </div>
      <ProjectDonors dataTest="ProposalListItem__ProjectDonors" proposalAddress={address} />
    </Fragment>
  );
};

export default memo(ProjectListItem);
