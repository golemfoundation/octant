import cx from 'classnames';
import { BigNumber } from 'ethers';
import React, { FC, Fragment } from 'react';

import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import useIndividualProposalRewards from 'hooks/queries/useIndividualProposalRewards';
import useProposalRewardsThresholdFraction from 'hooks/queries/useProposalRewardsThresholdFraction';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './ProposalRewards.module.scss';
import ProposalRewardsProps from './types';

const ProposalRewards: FC<ProposalRewardsProps> = ({
  canFoundedAtHide = true,
  className,
  MiddleElement,
  totalValueOfAllocations,
}) => {
  const { data: individualProposalRewards } = useIndividualProposalRewards();
  const { data: proposalRewardsThresholdFraction } = useProposalRewardsThresholdFraction();

  const cutOffValue =
    individualProposalRewards &&
    proposalRewardsThresholdFraction &&
    !individualProposalRewards.sum.isZero()
      ? BigNumber.from(individualProposalRewards.sum.toNumber() * proposalRewardsThresholdFraction)
      : BigNumber.from(0);

  const isProjectFounded = totalValueOfAllocations
    ? totalValueOfAllocations.gte(cutOffValue)
    : false;

  const isFundedAtHidden =
    cutOffValue.isZero() ||
    (canFoundedAtHide && !cutOffValue.isZero() && totalValueOfAllocations && isProjectFounded);

  const isTotalValueOfAllocationsDefined = totalValueOfAllocations !== undefined;

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.separator}>
        {isProjectFounded || !isTotalValueOfAllocationsDefined ? (
          <div className={styles.line} />
        ) : (
          <ProgressBar
            progressPercentage={
              totalValueOfAllocations &&
              cutOffValue &&
              totalValueOfAllocations.gt(0) &&
              cutOffValue.gt(0)
                ? totalValueOfAllocations.mul(100).div(cutOffValue).toNumber()
                : 0
            }
            variant="orange"
          />
        )}
      </div>
      <div className={styles.values}>
        {isTotalValueOfAllocationsDefined ? (
          <Fragment>
            <div className={styles.value}>
              <span className={styles.label}>Total donated</span>
              <span className={cx(styles.number, !isProjectFounded && styles.isBelowCutOff)}>
                {getFormattedEthValue(totalValueOfAllocations).fullString}
              </span>
            </div>
            {MiddleElement}
            <div className={cx(styles.value, isFundedAtHidden && styles.isHidden)}>
              <span className={styles.label}>Funded at</span>
              <span className={styles.number}>{getFormattedEthValue(cutOffValue).fullString}</span>
            </div>
          </Fragment>
        ) : (
          <div className={styles.allocationValuesNotAvailable}>
            Allocation values are not available
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalRewards;
