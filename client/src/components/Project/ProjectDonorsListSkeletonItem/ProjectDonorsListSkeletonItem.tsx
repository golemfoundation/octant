import React, { FC } from 'react';

import styles from './ProjectDonorsListSkeletonItem.module.scss';
import ProjectDonorsListSkeletonItemProps from './types';

const ProjectDonorsListSkeletonItem: FC<ProjectDonorsListSkeletonItemProps> = ({
  dataTest = 'DonorsItemSkeleton',
}) => (
  <div className={styles.root} data-test={dataTest}>
    <div className={styles.icon} />
    <div className={styles.address} />
    <div className={styles.value} />
  </div>
);

export default ProjectDonorsListSkeletonItem;
