import React, { FC } from 'react';

import ProposalListItem from 'components/Proposal/ProposalListitem';

import ProposalListProps from './types';

const ProposalList: FC<ProposalListProps> = ({ proposals, epoch }) => {
  return (
    <>
      {proposals.map(
        (
          {
            address,
            description,
            name,
            profileImageSmall,
            website,
            totalValueOfAllocations,
            numberOfDonors,
          },
          index,
        ) => (
          <ProposalListItem
            key={address}
            address={address}
            description={description}
            epoch={epoch}
            index={index}
            name={name}
            numberOfDonors={numberOfDonors}
            profileImageSmall={profileImageSmall}
            totalValueOfAllocations={totalValueOfAllocations}
            website={website}
          />
        ),
      )}
    </>
  );
};

export default ProposalList;
