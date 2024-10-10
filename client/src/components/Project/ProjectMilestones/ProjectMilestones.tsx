import React, { FC } from 'react';

import useGrantsPerProgram from 'hooks/queries/karmaGap/useGrantsPerProgram';

import ProjectMilestonesProps from './types';

const ProjectMilestones: FC<ProjectMilestonesProps> = ({ epoch }) => {
  const { data } = useGrantsPerProgram(epoch);
  // eslint-disable-next-line no-console
  console.log({ data });

  return <div>123</div>;
};

export default ProjectMilestones;
