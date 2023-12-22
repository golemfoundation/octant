import React, { FC, Fragment, memo, useMemo } from 'react';

import Donors from 'components/Proposal/ProposalDonors';
import ProposalListItemHeader from 'components/Proposal/ProposalListItemHeader';
import Rewards from 'components/shared/Rewards';
import Description from 'components/ui/Description';
import decodeBase64ToUtf8 from 'utils/decodeBase64ToUtf8';

import styles from './ProposalListItem.module.scss';
import ProposalListItemProps from './types';

const ProposalListItem: FC<ProposalListItemProps> = ({
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
        <ProposalListItemHeader
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
      <Donors dataTest="ProposalListItem__Donors" proposalAddress={address} />
    </Fragment>
  );
};

export default memo(ProposalListItem);
