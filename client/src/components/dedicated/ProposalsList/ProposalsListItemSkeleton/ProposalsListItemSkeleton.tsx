import cx from 'classnames';
import React, { FC } from 'react';

import styles from './ProposalsListItemSkeleton.module.scss';
import ProposalsListItemSkeletonProps from './types';

const ProposalsListItemSkeleton: FC<ProposalsListItemSkeletonProps> = ({ className }) => (
  <div className={cx(styles.root, className)} data-test="ProposalsListItemSkeleton">
    <div className={styles.image} />
    <div className={styles.title} />
    <div className={styles.description} />
    <div className={styles.description} />
    <div className={styles.description} />
    <div className={styles.proposalRewards}>
      <div>
        <div className={styles.row} />
        <div className={styles.row} />
      </div>
      <div>
        <div className={styles.row} />
        <div className={styles.row} />
      </div>
    </div>
  </div>
);

export default ProposalsListItemSkeleton;
