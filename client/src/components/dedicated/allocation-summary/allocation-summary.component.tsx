import { BigNumber } from 'ethers';
import React, { FC, Fragment } from 'react';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import Description from 'components/core/description/description.component';
import DoubleValue from 'components/core/double-value/double-value.component';
import Header from 'components/core/header/header.component';
import ProgressBar from 'components/core/progress-bar/progress-bar.component';
import getCryptoValueWithSuffix from 'utils/getCryptoValueWithSuffix';
import useCurrentEpoch from 'hooks/useCurrentEpoch';
import useIndividualProposalRewards from 'hooks/useIndividualProposalRewards';
import useIndividualReward from 'hooks/useIndividualReward';
import useMatchedRewards from 'hooks/useMatchedRewards';

import AllocationSummaryProps from './types';
import styles from './style.module.scss';

const AllocationSummary: FC<AllocationSummaryProps> = ({ newAllocationPercentage }) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: individualReward } = useIndividualReward();
  const { data: individualProposalRewards } = useIndividualProposalRewards();
  const { data: matchedRewards } = useMatchedRewards();

  const newTotalDonated = (individualReward! as BigNumber)
    .mul(newAllocationPercentage)
    .div(100)
    .add(individualProposalRewards?.sum || 0);

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
          labelLeft={`Donated ${newAllocationPercentage} %`}
          labelRight={`Claimable ${100 - newAllocationPercentage} %`}
          progressPercentage={newAllocationPercentage}
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
