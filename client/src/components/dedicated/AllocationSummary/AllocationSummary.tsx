import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import React, { FC, Fragment, useState } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import Svg from 'components/core/Svg/Svg';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useMatchedRewards from 'hooks/queries/useMatchedRewards';
import useProposals from 'hooks/queries/useProposals';
import { arrowRight } from 'svg/misc';
import { ExtendedProposal } from 'types/proposals';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationSummary.module.scss';
import ExpandableList from './ExpandableList/ExpandableList';
import AllocationSummaryProps from './types';

const getHeader = (
  proposals: ExtendedProposal[],
  allocations: AllocationSummaryProps['allocations'],
) => {
  if (allocations.length > 1) {
    return `Send funds to ${allocations.length} projects`;
  }
  const proposal = proposals.find(({ address }) => allocations[0] === address)!.name;

  return `Send funds to ${proposal}`;
};

const AllocationSummary: FC<AllocationSummaryProps> = ({ allocations, allocationValues = {} }) => {
  const [isProjectsTileExpanded, setIsProjectsTileExpanded] = useState<boolean>(false);
  const { data: currentEpoch } = useCurrentEpoch();
  const proposals = useProposals();
  const { data: individualReward } = useIndividualReward();
  const { data: matchedRewards } = useMatchedRewards();
  const newAllocationValuesSum = Object.values(allocationValues).reduce(
    (acc, value) => acc.add(parseUnits(value || '0')),
    BigNumber.from(0),
  );
  const newClaimableAndClaimed = (individualReward as BigNumber).sub(newAllocationValuesSum);

  const isExpandableListAvailable = allocations.length > 1;

  const budgetBefore = individualReward ? getFormattedEthValue(individualReward) : undefined;
  const budgetAfter = individualReward
    ? getFormattedEthValue(individualReward.sub(newAllocationValuesSum))
    : undefined;

  return (
    <Fragment>
      <Header text={`Confirm Epoch ${currentEpoch} Allocation`} />
      <BoxRounded
        alignment="left"
        className={styles.box}
        expandableChildren={
          isExpandableListAvailable ? (
            <ExpandableList allocations={allocations} allocationValues={allocationValues} />
          ) : null
        }
        isExpanded={isProjectsTileExpanded}
        isVertical
        onToggle={isExpanded => setIsProjectsTileExpanded(isExpanded)}
        suffix={`Estimated Match Funding ${
          matchedRewards ? getFormattedEthValue(matchedRewards).fullString : '0'
        }`}
        title={getHeader(proposals, allocations)}
      >
        <div className={styles.totalDonation}>
          {isProjectsTileExpanded && <div className={styles.label}>Total donation</div>}
          <DoubleValue mainValue={getFormattedEthValue(newAllocationValuesSum).fullString} />
        </div>
      </BoxRounded>
      <BoxRounded isVertical>
        <div className={styles.values}>
          <div>
            <div className={styles.header}>Budget {budgetBefore && `(${budgetBefore.suffix})`}</div>
            <DoubleValue
              className={styles.budgetValue}
              mainValue={budgetBefore ? budgetBefore.value : '0.0'}
            />
          </div>
          <div className={styles.separator}>
            <div className={styles.header} />
            <Svg img={arrowRight} size={[1.5, 1.4]} />
          </div>
          <div>
            <div className={styles.header}>
              After Allocation {budgetAfter && `(${budgetAfter.suffix})`}
            </div>
            <DoubleValue
              className={styles.budgetValue}
              mainValue={budgetAfter ? budgetAfter.value : '0.0'}
            />
          </div>
        </div>
        <ProgressBar
          className={styles.progressBar}
          labelLeft={`Allocations ${getFormattedEthValue(newAllocationValuesSum).fullString}`}
          labelRight={`Claimed ${getFormattedEthValue(newClaimableAndClaimed).fullString}`}
          progressPercentage={newAllocationValuesSum
            .mul(100)
            .div(newClaimableAndClaimed.add(newAllocationValuesSum))
            .toNumber()}
        />
      </BoxRounded>
    </Fragment>
  );
};

export default AllocationSummary;
