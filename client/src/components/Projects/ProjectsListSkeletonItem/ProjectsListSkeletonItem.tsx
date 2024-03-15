import cx from 'classnames';
import React, { FC } from 'react';

import styles from './ProjectsListSkeletonItem.module.scss';
import ProjectsListSkeletonItemProps from './types';

const ProjectsListSkeletonItem: FC<ProjectsListSkeletonItemProps> = ({ className }) => (
  <div className={cx(styles.root, className)} data-test="ProjectsListItemSkeleton">
    <div className={styles.image} />
    <div className={styles.title} />
    <div className={styles.description} />
    <div className={styles.description} />
    <div className={cx(styles.description, styles.isLast)} />
    <div className={styles.projectRewards}>
      <div>
        <div className={styles.row} />
        <div className={cx(styles.row, styles.value)} />
      </div>
      <div>
        <div className={styles.row} />
        <div className={cx(styles.row, styles.value)} />
      </div>
    </div>
  </div>
);

export default ProjectsListSkeletonItem;
