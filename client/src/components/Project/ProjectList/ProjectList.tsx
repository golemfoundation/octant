import React, { FC } from 'react';

import ProposalListItem from 'components/Project/ProjectListItem';

import ProjectListProps from './types';

const ProjectList: FC<ProjectListProps> = ({ proposals, epoch }) => (
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

export default ProjectList;
