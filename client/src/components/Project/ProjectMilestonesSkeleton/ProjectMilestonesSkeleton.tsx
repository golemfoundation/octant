import cx from 'classnames';
import React, { FC } from 'react';

import styles from './ProjectMilestonesSkeleton.module.scss';
import ProjectMilestonesSkeletonProps from './types';

const ProjectMilestonesSkeleton: FC<ProjectMilestonesSkeletonProps> = ({ className }) => (
  <div className={cx(styles.root, className)}>
    <div className={styles.rectangle1} />
    <div className={styles.rectangle2} />
  </div>
);

export default ProjectMilestonesSkeleton;
