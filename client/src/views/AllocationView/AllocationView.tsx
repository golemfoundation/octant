import cx from 'classnames';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { AnimatePresence } from 'framer-motion';
import isEmpty from 'lodash/isEmpty';
import React, { Fragment, ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import AllocationItem from 'components/Allocation/AllocationItem';
import AllocationNavigation from 'components/Allocation/AllocationNavigation';
import AllocationRewardsBox from 'components/Allocation/AllocationRewardsBox';
import AllocationSummary from 'components/Allocation/AllocationSummary';
import AllocationTipTiles from 'components/Allocation/AllocationTipTiles';
import Layout from 'components/shared/Layout';
import { ALLOCATION_REWARDS_FOR_PROPOSALS } from 'constants/localStorageKeys';
import useAllocate from 'hooks/events/useAllocate';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useHistory from 'hooks/queries/useHistory';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';
import useUserAllocationNonce from 'hooks/queries/useUserAllocationNonce';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import useAllocationsStore from 'store/allocations/store';
import triggerToast from 'utils/triggerToast';

import styles from './AllocationView.module.scss';
import { AllocationValues, CurrentView } from './types';
import {
  getAllocationValuesInitialState,
  getAllocationsWithRewards,
  getNewAllocationValues,
} from './utils';

const AllocationView = (): ReactElement => {
  const { isConnected } = useAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'views.allocation' });
  const [currentView, setCurrentView] = useState<CurrentView>('edit');
  const [isLocked, setIsLocked] = useState<boolean | undefined>(undefined);
  const [allocationValues, setAllocationValues] = useState<AllocationValues>([]);
  const [isRewardsForProposalsSet, setIsRewardsForProposalsSet] = useState<boolean>(false);
  const [allocationsEdited, setAllocationsEdited] = useState<string[]>([]);
  const { data: proposalsContract } = useProposalsContract();
  const { data: proposalsIpfsWithRewards } = useProposalsIpfsWithRewards();

  const { data: currentEpoch } = useCurrentEpoch();
  const { refetch: refetchHistory } = useHistory();
  const {
    data: userAllocations,
    isFetching: isFetchingUserAllocation,
    refetch: refetchUserAllocations,
  } = useUserAllocations(undefined, { refetchOnMount: true });
  const { data: individualReward } = useIndividualReward();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { refetch: refetchWithdrawals } = useWithdrawals();
  const {
    data: userNonce,
    isFetching: isFetchingUserNonce,
    refetch: refetchUserAllocationNonce,
  } = useUserAllocationNonce();
  const { refetch: refetchMatchedProposalRewards } = useMatchedProposalRewards();
  const { allocations, rewardsForProposals, setAllocations, setRewardsForProposals } =
    useAllocationsStore(state => ({
      allocations: state.data.allocations,
      rewardsForProposals: state.data.rewardsForProposals,
      setAllocations: state.setAllocations,
      setRewardsForProposals: state.setRewardsForProposals,
    }));

  const allocateEvent = useAllocate({
    nonce: userNonce!,
    onSuccess: async () => {
      setCurrentView('edit');
      triggerToast({
        title: t('allocationSuccessful'),
      });
      refetchMatchedProposalRewards();
      refetchUserAllocations();
      refetchUserAllocationNonce();
      refetchHistory();
      refetchWithdrawals();
      setAllocations([
        ...allocations.filter(allocation => {
          const allocationValue = allocationValues.find(({ address }) => address === allocation);
          return !allocationValue?.value.isZero();
        }),
      ]);
      setIsLocked(true);
    },
  });

  useEffect(() => {
    /**
     * This hook adds rewardsForProposals to the store.
     * It needs to be done here, since user can change rewardsForProposals and leave the view.
     * When they reenter it, they need to see their latest allocation locked in the slider.
     */
    if (!isConnected) {
      setIsRewardsForProposalsSet(true);
    }
    if (!individualReward || !userAllocations) {
      return;
    }

    const localStorageRewardsForProposals = BigNumber.from(
      JSON.parse(localStorage.getItem(ALLOCATION_REWARDS_FOR_PROPOSALS) || 'null'),
    );
    if (userAllocations.elements.length > 0) {
      const userAllocationsSum = userAllocations.elements.reduce(
        (acc, curr) => acc.add(curr.value),
        BigNumber.from(0),
      );
      setRewardsForProposals(userAllocationsSum);
    } else {
      setRewardsForProposals(
        localStorageRewardsForProposals.gt(individualReward)
          ? BigNumber.from(0)
          : localStorageRewardsForProposals,
      );
    }
    setIsRewardsForProposalsSet(true);
    // .toHexString(), because React can't compare objects as deps in hooks, causing infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, individualReward?.toHexString(), userAllocations?.elements.length]);

  const onResetAllocationValues = () => {
    if (
      !isRewardsForProposalsSet ||
      currentEpoch === undefined ||
      (isConnected && !userAllocations && currentEpoch > 1) ||
      !rewardsForProposals
    ) {
      return;
    }
    const allocationValuesNew = getAllocationValuesInitialState({
      allocationValues,
      allocations,
      allocationsEdited,
      rewardsForProposals,
      userAllocationsElements: userAllocations?.elements,
    });
    setAllocationValues(allocationValuesNew);
  };

  useEffect(() => {
    onResetAllocationValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentEpoch,
    allocations,
    isRewardsForProposalsSet,
    userAllocations?.elements.length,
    userNonce,
  ]);

  useEffect(() => {
    if (!isRewardsForProposalsSet) {
      return;
    }

    if (rewardsForProposals.isZero()) {
      onResetAllocationValues();
      return;
    }

    if (rewardsForProposals.isZero()) {
      setAllocationValues(
        allocationValues.map(allocation => ({
          ...allocation,
          value: BigNumber.from(0),
        })),
      );
      setAllocationsEdited([]);
      return;
    }

    if (!rewardsForProposals.isZero()) {
      onResetAllocationValues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardsForProposals]);

  const onAllocate = () => {
    if (userNonce === undefined || proposalsContract === undefined) {
      return;
    }
    /**
     * Whenever user wants to send an empty allocation (no projects, or all of them value 0)
     * Push one element with value 0. It should be fixed on BE by creating "personal all" endpoint,
     * but there is no ticket for it yet.
     */
    const allocationValuesNew = [...allocationValues];
    if (allocationValuesNew.length === 0) {
      allocationValuesNew.push({
        address: proposalsContract[0],
        value: BigNumber.from(0),
      });
    }
    allocateEvent.emit(allocationValuesNew);
  };

  useEffect(() => {
    if (!currentEpoch) {
      return;
    }
    if (userAllocations && currentEpoch > 1) {
      setIsLocked(userAllocations.hasUserAlreadyDoneAllocation);
      return;
    }
    setIsLocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpoch, userAllocations?.elements.length]);

  const onChangeAllocationItemValue = (proposalAddressToModify: string, newValue: string) => {
    const newValueBigNumber = parseUnits(newValue, 'wei');
    const isProposalAddressToModifyEdited = allocationsEdited.includes(proposalAddressToModify);
    const allocationsEditedNew = isProposalAddressToModifyEdited
      ? allocationsEdited
      : [...allocationsEdited, proposalAddressToModify];
    if (!isProposalAddressToModifyEdited) {
      setAllocationsEdited(allocationsEditedNew);
    }

    const newAllocationValues = getNewAllocationValues({
      allocationValues,
      allocationsEdited: allocationsEditedNew,
      individualReward,
      newValue: newValueBigNumber,
      proposalAddressToModify,
      rewardsForProposals,
    });
    setAllocationValues(newAllocationValues);
  };

  const isLoading =
    allocationValues === undefined ||
    (isConnected && isFetchingUserNonce) ||
    (isConnected && isFetchingUserAllocation);
  const areAllocationsAvailableOrAlreadyDone =
    (allocationValues !== undefined && !isEmpty(allocations)) ||
    !!userAllocations?.hasUserAlreadyDoneAllocation;
  const hasUserIndividualReward = !!individualReward && !individualReward.isZero();
  const areButtonsDisabled =
    isLoading ||
    !isConnected ||
    !isDecisionWindowOpen ||
    isLocked ||
    (!areAllocationsAvailableOrAlreadyDone && !rewardsForProposals.isZero()) ||
    !!individualReward?.isZero();

  const allocationsWithRewards = getAllocationsWithRewards({
    allocationValues,
    areAllocationsAvailableOrAlreadyDone,
    proposalsIpfsWithRewards,
    userAllocationsElements: userAllocations?.elements,
  });

  const isEpoch1 = currentEpoch === 1;

  const showAllocationBottomNavigation =
    !isEpoch1 && areAllocationsAvailableOrAlreadyDone && hasUserIndividualReward && !isLocked;

  return (
    <Layout
      dataTest="AllocationView"
      isLoading={isLoading}
      navigationBottomSuffix={
        showAllocationBottomNavigation && (
          <AllocationNavigation
            areButtonsDisabled={areButtonsDisabled}
            currentView={currentView}
            isLoading={allocateEvent.isLoading}
            onAllocate={onAllocate}
            onResetValues={() => onResetAllocationValues()}
            setCurrentView={setCurrentView}
          />
        )
      }
    >
      {currentView === 'edit' ? (
        <Fragment>
          <AllocationTipTiles className={styles.box} />
          {!isEpoch1 && (
            <AllocationRewardsBox
              className={styles.box}
              isDisabled={!isDecisionWindowOpen || !hasUserIndividualReward}
              isLocked={isLocked}
              /* eslint-disable-next-line @typescript-eslint/naming-convention */
              onUnlock={isDecisionWindowOpen ? () => setIsLocked(prev => !prev) : () => {}}
            />
          )}
          {areAllocationsAvailableOrAlreadyDone && (
            <AnimatePresence initial={false}>
              {allocationsWithRewards!.map(
                ({ address, isAllocatedTo, isLoadingError, value, profileImageSmall, name }) => (
                  <AllocationItem
                    key={address}
                    address={address}
                    className={cx(styles.box, styles.isAllocation)}
                    isAllocatedTo={isAllocatedTo}
                    isLoadingError={isLoadingError}
                    isManuallyEdited={allocationsEdited.includes(address)}
                    name={name}
                    onChange={onChangeAllocationItemValue}
                    profileImageSmall={profileImageSmall}
                    value={value}
                  />
                ),
              )}
            </AnimatePresence>
          )}
        </Fragment>
      ) : (
        <AllocationSummary allocationValues={allocationValues} />
      )}
    </Layout>
  );
};

export default AllocationView;
