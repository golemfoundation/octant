import cx from 'classnames';
import { BigNumber } from 'ethers';
import isEmpty from 'lodash/isEmpty';
import React, { Fragment, ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import AllocateRewardsBox from 'components/dedicated/AllocateRewardsBox/AllocateRewardsBox';
import AllocationEmptyState from 'components/dedicated/AllocationEmptyState/AllocationEmptyState';
import AllocationItem from 'components/dedicated/AllocationItem/AllocationItem';
import AllocationNavigation from 'components/dedicated/AllocationNavigation/AllocationNavigation';
import AllocationSummary from 'components/dedicated/AllocationSummary/AllocationSummary';
import AllocationTipTiles from 'components/dedicated/AllocationTipTiles/AllocationTipTiles';
import ModalAllocationValuesEdit from 'components/dedicated/ModalAllocationValuesEdit/ModalAllocationValuesEdit';
import { ALLOCATION_REWARDS_FOR_PROPOSALS } from 'constants/localStorageKeys';
import useAllocate from 'hooks/events/useAllocate';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useHistory from 'hooks/queries/useHistory';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';
import useUserAllocationNonce from 'hooks/queries/useUserAllocationNonce';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useAllocationsStore from 'store/allocations/store';
import triggerToast from 'utils/triggerToast';

import styles from './AllocationView.module.scss';
import { AllocationValues, CurrentView } from './types';
import {
  getAllocationValuesInitialState,
  getAllocationsWithRewards,
  getRestToDistribute,
  getNewAllocationValues,
} from './utils';

const AllocationView = (): ReactElement => {
  const { isConnected } = useAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'views.allocation' });
  const [currentView, setCurrentView] = useState<CurrentView>('edit');
  const [isLocked, setIsLocked] = useState<boolean | undefined>(undefined);
  const [selectedItemAddress, setSelectedItemAddress] = useState<null | string>(null);
  const [allocationValues, setAllocationValues] = useState<AllocationValues>([]);
  const [isRewardsForProposalsSet, setIsRewardsForProposalsSet] = useState<boolean>(false);
  const [hasZeroRewardsForProposalsBeenReached, setHasZeroRewardsForProposalsBeenReached] =
    useState<boolean>(false);
  const [allocationsEdited, setAllocationsEdited] = useState<string[]>([]);
  const [
    areAllocationValuesEqualRewardsForProposals,
    setAreAllocationValuesEqualRewardsForProposals,
  ] = useState<boolean>(false);
  const { data: proposalsContract } = useProposalsContract();
  const { data: proposalsIpfs } = useProposalsIpfs(proposalsContract);
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
      setSelectedItemAddress(null);
      triggerToast({
        title: t('allocationSuccessful'),
      });
      refetchMatchedProposalRewards();
      refetchUserAllocations();
      refetchUserAllocationNonce();
      refetchHistory();
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
  }, [individualReward?.toHexString(), userAllocations?.elements.length]);

  const _setAllocationValues = (allocationValuesNew: AllocationValues) => {
    setAllocationValues(allocationValuesNew);

    const allocationValuesNewSum = allocationValuesNew.reduce(
      (acc, { value }) => acc.add(value),
      BigNumber.from(0),
    );

    if (!allocationValuesNewSum.eq(rewardsForProposals)) {
      setAreAllocationValuesEqualRewardsForProposals(false);
    } else {
      setAreAllocationValuesEqualRewardsForProposals(true);
    }
  };

  const onResetAllocationValues = (
    shouldSetEqualValues = true,
    shouldResetAllocationsEdited = true,
  ) => {
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
      hasZeroRewardsForProposalsBeenReached,
      rewardsForProposals,
      shouldSetEqualValues,
      userAllocationsElements: userAllocations?.elements,
    });
    if (shouldResetAllocationsEdited) {
      setAllocationsEdited([]);
    }
    _setAllocationValues(allocationValuesNew);
  };

  useEffect(() => {
    const shouldSetEqualValues = !userAllocations || userAllocations.elements.length === 0;
    onResetAllocationValues(shouldSetEqualValues);
    /**
     * This hook should NOT run when user unlocks the allocation.
     * Only when userAllocations are fetched OR after rewardsForProposals value changes.
     *
     * Comparing userAllocations?.elements.length may not be enough -- what if user changes values
     * but not the number of projects?
     *
     * Hence the check for userNonce. Whenever allocation is done we refetch userNonce
     * and we should run this hook.
     */
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

    if (rewardsForProposals.isZero() && hasZeroRewardsForProposalsBeenReached) {
      onResetAllocationValues(true, false);
      return;
    }

    if (rewardsForProposals.isZero() && !hasZeroRewardsForProposalsBeenReached) {
      setAllocationValues(
        allocationValues.map(allocation => ({
          ...allocation,
          value: BigNumber.from(0),
        })),
      );
      setAllocationsEdited([]);
      setHasZeroRewardsForProposalsBeenReached(true);
      return;
    }

    if (!rewardsForProposals.isZero()) {
      if (hasZeroRewardsForProposalsBeenReached) {
        setHasZeroRewardsForProposalsBeenReached(false);
      }
      const shouldSetEqualValues =
        !hasZeroRewardsForProposalsBeenReached &&
        !!userAllocations &&
        userAllocations?.elements.length === 0 &&
        allocationsEdited.length === 0;
      onResetAllocationValues(shouldSetEqualValues, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardsForProposals, hasZeroRewardsForProposalsBeenReached]);

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

  const onChangeAllocationItemValue = (proposalAddressToModify: string, newValue: BigNumber) => {
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
      newValue,
      proposalAddressToModify,
      rewardsForProposals,
    });
    _setAllocationValues(newAllocationValues);
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
    !areAllocationValuesEqualRewardsForProposals ||
    (!areAllocationsAvailableOrAlreadyDone && !rewardsForProposals.isZero()) ||
    !!individualReward?.isZero();

  const allocationsWithRewards = getAllocationsWithRewards({
    allocationValues,
    areAllocationsAvailableOrAlreadyDone,
    proposalsIpfsWithRewards,
    userAllocationsElements: userAllocations?.elements,
  });

  const selectedItemName = selectedItemAddress
    ? proposalsIpfs?.find(({ address }) => address === selectedItemAddress)!.name
    : '';

  const restToDistribute = getRestToDistribute({
    allocationValues,
    allocationsEdited,
    individualReward,
    rewardsForProposals,
  });

  const isEpoch1 = currentEpoch === 1;

  const showAllocationBottomNavigation =
    !isEpoch1 && areAllocationsAvailableOrAlreadyDone && hasUserIndividualReward && !isLocked;

  return (
    <MainLayout
      dataTest="AllocationView"
      isLoading={isLoading}
      navigationBottomSuffix={
        showAllocationBottomNavigation && (
          <AllocationNavigation
            areButtonsDisabled={areButtonsDisabled}
            currentView={currentView}
            isLoading={allocateEvent.isLoading}
            isPrevResetButtonEnabled={
              !areAllocationValuesEqualRewardsForProposals && areButtonsDisabled
            }
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
          {!isEpoch1 && hasUserIndividualReward && (
            <AllocateRewardsBox
              className={styles.box}
              isDisabled={isLocked}
              /* eslint-disable-next-line @typescript-eslint/naming-convention */
              onUnlock={() => setIsLocked(prev => !prev)}
            />
          )}
          {areAllocationsAvailableOrAlreadyDone && (
            <Fragment>
              {allocationsWithRewards!.map(allocation => (
                <AllocationItem
                  key={allocation.address}
                  address={allocation.address}
                  className={cx(styles.box, styles.isAllocation)}
                  isAllocatedTo={allocation.isAllocatedTo}
                  isDisabled={
                    isLocked || (restToDistribute.isZero() && allocationsEdited.length === 0)
                  }
                  isLoadingError={allocation.isLoadingError}
                  isLocked={!!isLocked}
                  isManuallyEdited={allocationsEdited.includes(allocation.address)}
                  onSelectItem={setSelectedItemAddress}
                  value={allocation.value}
                />
              ))}
            </Fragment>
          )}
          {!areAllocationsAvailableOrAlreadyDone && !hasUserIndividualReward && (
            <AllocationEmptyState />
          )}
          <ModalAllocationValuesEdit
            isLimitVisible
            isManuallyEdited={
              selectedItemAddress ? allocationsEdited.includes(selectedItemAddress) : false
            }
            modalProps={{
              header: t('modalAllocationValuesEdit.header', { allocation: selectedItemName }),
              isOpen: selectedItemAddress !== null,
              onClosePanel: () => setSelectedItemAddress(null),
            }}
            onUpdateValue={newValue => {
              onChangeAllocationItemValue(selectedItemAddress!, newValue);
            }}
            restToDistribute={restToDistribute}
            valueCryptoSelected={
              selectedItemAddress && allocationValues
                ? allocationValues.find(({ address }) => address === selectedItemAddress)!.value
                : BigNumber.from(0)
            }
            valueCryptoTotal={rewardsForProposals}
          />
        </Fragment>
      ) : (
        <AllocationSummary allocationValues={allocationValues} />
      )}
    </MainLayout>
  );
};

export default AllocationView;
