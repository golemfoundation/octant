import React, { FC } from 'react';

import ProjectListItem from 'components/Project/ProjectListItem';

import ProjectListProps from './types';

const ProjectList: FC<ProjectListProps> = ({ projects, epoch }) => (
  <>
    {projects.map(
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
        <ProjectListItem
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
