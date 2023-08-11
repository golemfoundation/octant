import cx from 'classnames';
import React, { FC } from 'react';

import styles from './ProposalItemSkeleton.module.scss';
import ProposalItemSkeletonProps from './types';

const ProposalItemSkeleton: FC<ProposalItemSkeletonProps> = ({ className }) => (
  <div className={cx(styles.root, className)} data-test="ProposalItemSkeleton">
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

export default ProposalItemSkeleton;
