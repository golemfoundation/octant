import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import useGrantsPerProgram from 'hooks/queries/karmaGap/useMilestonesPerGrantPerProgram';

import ProjectMilestonesProps from './types';

const ProjectMilestones: FC<ProjectMilestonesProps> = ({ projectAddress }) => {
  const { epoch } = useParams();

  const epochNumber = parseInt(epoch!, 10);

  const { data, isFetching } = useGrantsPerProgram(epochNumber, projectAddress);
  // eslint-disable-next-line no-console
  console.log({ data });

  return <div>{isFetching ? 'Loading...' : 123}</div>;
};

export default ProjectMilestones;
