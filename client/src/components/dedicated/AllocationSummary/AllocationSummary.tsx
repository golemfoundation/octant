import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { FC, Fragment } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Description from 'components/core/Description/Description';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import getCryptoValueWithSuffix from 'utils/getCryptoValueWithSuffix';
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
        <DoubleValue
          mainValue={getCryptoValueWithSuffix({ suffix: 'ETH', value: individualReward })}
        />
        <ProgressBar
          className={styles.progressBar}
          labelLeft={`Donated ${formatUnits(newAllocationValueBigNumber)}`}
          labelRight={`Claimable and claimed ${formatUnits(newClaimableAndClaimed)}`}
          progressPercentage={newAllocationValueBigNumber
            .mul(100)
            .div(newClaimableAndClaimed.add(newAllocationValueBigNumber))
            .toNumber()}
        />
      </BoxRounded>
      <BoxRounded alignment="left" className={styles.box} isVertical title="Total Donated">
        <DoubleValue
          mainValue={getCryptoValueWithSuffix({
            suffix: 'ETH',
            value: newTotalDonated,
          })}
        />
        <ProgressBar
          className={styles.progressBar}
          labelLeft={`Donated ${getCryptoValueWithSuffix({
            suffix: 'ETH',
            value: newTotalDonated,
          })}`}
          labelRight={`Matched ${getCryptoValueWithSuffix({
            suffix: 'ETH',
            value: matchedRewards,
          })}`}
          progressPercentage={
            matchedRewards ? newTotalDonated.add(matchedRewards).div(matchedRewards).toNumber() : 0
          }
        />
      </BoxRounded>
    </Fragment>
  );
};

export default AllocationSummary;
