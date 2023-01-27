import { BigNumber } from 'ethers';
import React, { FC, Fragment } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Description from 'components/core/Description/Description';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import useCurrentEpoch from 'hooks/useCurrentEpoch';
import useIndividualProposalRewards from 'hooks/useIndividualProposalRewards';
import useIndividualReward from 'hooks/useIndividualReward';
import useMatchedRewards from 'hooks/useMatchedRewards';
import useUserAllocations from 'hooks/useUserAllocations';
import getFormattedUnits from 'utils/getFormattedUnit';
import getNewAllocationValuesBigNumber from 'utils/getNewAllocationValuesBigNumber';

import styles from './style.module.scss';
import AllocationSummaryProps from './types';

const AllocationSummary: FC<AllocationSummaryProps> = ({ newAllocationValues }) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: userAllocations } = useUserAllocations();
  const { data: individualReward } = useIndividualReward();
  const { data: individualProposalRewards } = useIndividualProposalRewards();
  const { data: matchedRewards } = useMatchedRewards();

  const currentUserAllocationsSum = userAllocations?.reduce(
    (acc, { allocation }) => acc.add(allocation),
    BigNumber.from(0),
  );
  const newAllocationValuesBigNumber = getNewAllocationValuesBigNumber(newAllocationValues);

  const newAllocationValuesSum = newAllocationValuesBigNumber.reduce(
    (acc, { value }) => acc.add(value),
    BigNumber.from(0),
  );
  const newClaimableAndClaimed = (individualReward as BigNumber).sub(newAllocationValuesSum);

  // newAllocationValuesSum replaces currentUserAllocationsSum.
  const newTotalDonated = newAllocationValuesSum
    .add(individualProposalRewards?.sum || 0)
    .sub(currentUserAllocationsSum || 0);

  return (
    <Fragment>
      <div className={styles.breadcrumbs}>Allocate -&gt; Decisions</div>
      <Header text={`Epoch ${currentEpoch} Decisions`} />
      <Description text="These are your decisions about how to use your staking rewards this epoch. Tap Confirm to finalise them in your wallet or Edit to change." />
      <BoxRounded alignment="left" className={styles.box} isVertical title="Reward Budget">
        <DoubleValue mainValue={individualReward ? getFormattedUnits(individualReward) : '0.0'} />
        <ProgressBar
          className={styles.progressBar}
          labelLeft={`Donated ${getFormattedUnits(newAllocationValuesSum)}`}
          labelRight={`Claimed ${getFormattedUnits(newClaimableAndClaimed)}`}
          progressPercentage={newAllocationValuesSum
            .mul(100)
            .div(newClaimableAndClaimed.add(newAllocationValuesSum))
            .toNumber()}
        />
      </BoxRounded>
      <BoxRounded alignment="left" className={styles.box} isVertical title="Total Donated">
        <DoubleValue mainValue={getFormattedUnits(newTotalDonated)} />
        <ProgressBar
          className={styles.progressBar}
          labelLeft={`Donated ${getFormattedUnits(newTotalDonated)}`}
          labelRight={`Matched ${matchedRewards ? getFormattedUnits(matchedRewards) : '0.0'}`}
          progressPercentage={
            matchedRewards ? newTotalDonated.add(matchedRewards).div(matchedRewards).toNumber() : 0
          }
        />
      </BoxRounded>
    </Fragment>
  );
};

export default AllocationSummary;
