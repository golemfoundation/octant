import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Svg from 'components/core/Svg/Svg';
import ProposalLoadingStates from 'components/dedicated/ProposalLoadingStates/ProposalLoadingStates';
import useIndividualProposalRewards from 'hooks/queries/useIndividualProposalRewards';
import useProposalRewardsThresholdFraction from 'hooks/queries/useProposalRewardsThresholdFraction';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useAllocationsStore from 'store/allocations/store';
import { checkMark, pencil } from 'svg/misc';
import getCutOffValueBigNumber from 'utils/getCutOffValueBigNumber';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationItem.module.scss';
import AllocationItemProps from './types';

const AllocationItem: FC<AllocationItemProps> = ({
  address,
  className,
  isAllocatedTo,
  isDisabled,
  isLocked,
  isManuallyEdited,
  onSelectItem,
  totalValueOfAllocations,
  value,
}) => {
  const { isConnected } = useAccount();
  const { data: proposalRewardsThresholdFraction } = useProposalRewardsThresholdFraction();
  const { data: individualProposalRewards } = useIndividualProposalRewards();
  const { data: proposalsIpfs, isLoading } = useProposalsIpfs([address]);
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
  }));
  const { name, isLoadingError } = proposalsIpfs[0] || {};

  const isLoadingStates = isLoadingError || isLoading;

  const percentToRender = rewardsForProposals.isZero()
    ? 0
    : value.mul(100).div(rewardsForProposals).toNumber();
  const valueToRender = getFormattedEthValue(value).fullString;

  const cutOffValue = getCutOffValueBigNumber(
    individualProposalRewards?.sum,
    proposalRewardsThresholdFraction,
  );

  const isProjectFounded = totalValueOfAllocations
    ? totalValueOfAllocations.gte(cutOffValue)
    : false;

  const individualProposalReward = individualProposalRewards?.projects.find(
    ({ address: individualProposalRewardAddress }) => individualProposalRewardAddress === address,
  );

  return (
    <BoxRounded
      alignment="center"
      className={cx(styles.root, className)}
      isVertical
      justifyContent="center"
      onClick={isConnected && !isDisabled ? () => onSelectItem(address) : undefined}
    >
      {isLoadingStates ? (
        <ProposalLoadingStates isLoading={isLoading} isLoadingError={isLoadingError} />
      ) : (
        <Fragment>
          <div className={styles.name}>{name}</div>
          {(isAllocatedTo || isManuallyEdited) && (
            <div className={styles.icons}>
              {isAllocatedTo && isLocked && (
                <Svg classNameSvg={styles.icon} img={checkMark} size={2.4} />
              )}
              {isManuallyEdited && !isLocked && (
                <Svg classNameSvg={styles.icon} img={pencil} size={2.4} />
              )}
            </div>
          )}
          <div className={styles.valuesBox}>
            <div className={styles.ethNeeded}>
              <div className={cx(styles.dot, isProjectFounded && styles.isProjectFounded)} />
              {individualProposalReward &&
                `${getFormattedEthValue(individualProposalReward.donated).value} of ${
                  getFormattedEthValue(cutOffValue).fullString
                } needed`}
            </div>
            <div className={styles.allocated}>
              <div className={styles.allocatedPercentage}>{percentToRender}%</div>
              <div className={styles.allocatedAmount}>{valueToRender}</div>
            </div>
          </div>
        </Fragment>
      )}
    </BoxRounded>
  );
};

export default AllocationItem;
