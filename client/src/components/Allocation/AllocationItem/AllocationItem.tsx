import cx from 'classnames';
import React, { FC, Fragment, memo } from 'react';
import { useAccount } from 'wagmi';

import AllocationItemRewards from 'components/Allocation/AllocationItemRewards';
import AllocationItemSkeleton from 'components/Allocation/AllocationItemSkeleton';
import BoxRounded from 'components/ui/BoxRounded';
import Img from 'components/ui/Img';
import Svg from 'components/ui/Svg';
import env from 'env';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import useAllocationsStore from 'store/allocations/store';
import { checkMark, pencil } from 'svg/misc';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationItem.module.scss';
import AllocationItemProps from './types';

const AllocationItem: FC<AllocationItemProps> = ({
  address,
  className,
  isAllocatedTo,
  isDisabled,
  isLoadingError,
  isLocked,
  isManuallyEdited,
  name,
  onSelectItem,
  profileImageSmall,
  value,
}) => {
  const { ipfsGateway } = env;
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { isFetching: isFetchingRewardsThreshold } = useProposalRewardsThreshold();
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
  }));

  const isLoading = currentEpoch === undefined || isFetchingRewardsThreshold;

  const percentToRender = rewardsForProposals.isZero()
    ? 0
    : value.mul(100).div(rewardsForProposals).toNumber();
  const valueToRender = getFormattedEthValue(value).fullString;

  const isEpoch1 = currentEpoch === 1;

  return (
    <BoxRounded
      className={cx(styles.root, className)}
      onClick={isConnected && !isDisabled ? () => onSelectItem(address) : undefined}
    >
      {(isLoading || isLoadingError) && <AllocationItemSkeleton />}
      {!isLoading && !isLoadingError && (
        <Fragment>
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
          <div className={styles.nameAndRewards}>
            <div className={styles.name}>
              <Img
                className={styles.image}
                dataTest="ProposalItem__imageProfile"
                src={`${ipfsGateway}${profileImageSmall}`}
              />
              {name}
            </div>
            <AllocationItemRewards address={address} className={styles.rewards} />
          </div>
          <div className={cx(styles.allocated, isEpoch1 && styles.isEpoch1)}>
            <div className={styles.allocatedPercentage}>{percentToRender}%</div>
            <div className={styles.allocatedAmount}>{valueToRender}</div>
          </div>
        </Fragment>
      )}
    </BoxRounded>
  );
};

export default memo(AllocationItem);
