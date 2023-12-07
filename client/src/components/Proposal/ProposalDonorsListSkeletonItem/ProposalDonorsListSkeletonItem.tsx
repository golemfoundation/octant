import React, { FC } from 'react';

import styles from './ProposalDonorsListSkeletonItem.module.scss';
import ProposalDonorsListSkeletonItemProps from './types';

const ProposalDonorsListSkeletonItem: FC<ProposalDonorsListSkeletonItemProps> = ({
  dataTest = 'DonorsItemSkeleton',
}) => (
  <div className={styles.root} data-test={dataTest}>
    <div className={styles.icon} />
    <div className={styles.address} />
    <div className={styles.value} />
  </div>
);

export default ProposalDonorsListSkeletonItem;
