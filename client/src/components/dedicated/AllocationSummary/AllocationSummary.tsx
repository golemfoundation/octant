import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import React, { FC, Fragment } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Description from 'components/core/Description/Description';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import getFormattedUnits from 'utils/getFormattedUnit';
import useCurrentEpoch from 'hooks/useCurrentEpoch';
import useIndividualProposalRewards from 'hooks/useIndividualProposalRewards';
import useIndividualReward from 'hooks/useIndividualReward';
import useMatchedRewards from 'hooks/useMatchedRewards';

import AllocationSummaryProps from './types';
import styles from './style.module.scss';

const AllocationSummary: FC<AllocationSummaryProps> = ({ newAllocationValue }) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: individualReward } = useIndividualReward();
  const { data: individualProposalRewards } = useIndividualProposalRewards();
  const { data: matchedRewards } = useMatchedRewards();

  const newAllocationValueBigNumber = parseUnits(newAllocationValue);
  const newTotalDonated = newAllocationValueBigNumber.add(individualProposalRewards?.sum || 0);
  const newClaimableAndClaimed = (individualReward as BigNumber).sub(newAllocationValueBigNumber);

  return (
    <Fragment>
      <div className={styles.breadcrumbs}>Allocate -&gt; Decisions</div>
      <Header text={`Epoch ${currentEpoch} Decisions`} />
      <Description text="These are your decisions about how to use your staking rewards this epoch. Tap Confirm to finalise them in your wallet or Edit to change." />
      <BoxRounded alignment="left" className={styles.box} isVertical title="Reward Budget">
        <DoubleValue mainValue={individualReward ? getFormattedUnits(individualReward) : '0.0'} />
        <ProgressBar
          className={styles.progressBar}
          labelLeft={`Donated ${getFormattedUnits(newAllocationValueBigNumber)}`}
          labelRight={`Claimed ${getFormattedUnits(newClaimableAndClaimed)}`}
          progressPercentage={newAllocationValueBigNumber
            .mul(100)
            .div(newClaimableAndClaimed.add(newAllocationValueBigNumber))
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
