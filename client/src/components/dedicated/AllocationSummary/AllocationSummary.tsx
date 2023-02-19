import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import React, { FC, Fragment, useState } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useMatchedRewards from 'hooks/queries/useMatchedRewards';
import useProposals from 'hooks/queries/useProposals';
import getFormattedUnits from 'utils/getFormattedUnit';

import styles from './AllocationSummary.module.scss';
import ExpandableList from './ExpandableList/ExpandableList';
import AllocationSummaryProps from './types';

const getHeader = (proposals, allocations) => {
  if (allocations.length > 1) {
    return `Send funds to ${allocations.length} projects`;
  }
  const proposal = proposals.find(({ id }) => allocations[0] === id.toNumber()).name;

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
          matchedRewards ? getFormattedUnits(matchedRewards) : '0'
        }`}
        title={getHeader(proposals, allocations)}
      >
        <div className={styles.totalDonation}>
          {isProjectsTileExpanded && <div className={styles.label}>Total donation</div>}
          <DoubleValue mainValue={getFormattedUnits(newAllocationValuesSum)} />
        </div>
      </BoxRounded>
      <BoxRounded isVertical>
        <div className={styles.values}>
          <div>
            <div className={styles.header}>Current Budget</div>
            <DoubleValue
              mainValue={individualReward ? getFormattedUnits(individualReward) : '0.0'}
            />
          </div>
          <div className={styles.separator}>
            <div className={styles.header} />
            -&gt;
          </div>
          <div>
            <div className={styles.header}>After Allocation</div>
            <DoubleValue
              mainValue={
                individualReward
                  ? getFormattedUnits(individualReward.sub(newAllocationValuesSum))
                  : '0.0'
              }
            />
          </div>
        </div>
        <ProgressBar
          className={styles.progressBar}
          labelLeft={`Allocations ${getFormattedUnits(newAllocationValuesSum)}`}
          labelRight={`Claimed ${getFormattedUnits(newClaimableAndClaimed)}`}
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
