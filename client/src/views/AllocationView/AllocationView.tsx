import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import AllocationItem from 'components/Allocation/AllocationItem';
import AllocationItemSkeleton from 'components/Allocation/AllocationItemSkeleton';
import AllocationNavigation from 'components/Allocation/AllocationNavigation';
import AllocationRewardsBox from 'components/Allocation/AllocationRewardsBox';
import AllocationSummary from 'components/Allocation/AllocationSummary';
import AllocationTipTiles from 'components/Allocation/AllocationTipTiles';
import Layout from 'components/shared/Layout';
import useAllocate from 'hooks/events/useAllocate';
import useAllocationViewSetRewardsForProposals from 'hooks/helpers/useAllocationViewSetRewardsForProposals';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useAllocateSimulate from 'hooks/mutations/useAllocateSimulate';
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
import { AllocationValue, AllocationValues, CurrentView, PercentageProportions } from './types';
import {
  getAllocationValuesInitialState,
  getAllocationsWithRewards,
  getAllocationValuesAfterManualChange,
} from './utils';

const AllocationView = (): ReactElement => {
  const { isConnected } = useAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'views.allocation' });
  const [currentView, setCurrentView] = useState<CurrentView>('edit');
  const [allocationValues, setAllocationValues] = useState<AllocationValues>([]);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [addressesWithError, setAddressesWithError] = useState<string[]>([]);
  const [percentageProportions, setPercentageProportions] = useState<PercentageProportions>({});
  const { data: proposalsContract } = useProposalsContract();
  const { data: proposalsIpfsWithRewards } = useProposalsIpfsWithRewards();
  const { isRewardsForProposalsSet } = useAllocationViewSetRewardsForProposals();
  const {
    data: allocationSimulated,
    mutateAsync: mutateAsyncAllocateSimulate,
    isLoading: isLoadingAllocateSimulate,
    reset: resetAllocateSimulate,
  } = useAllocateSimulate();

  const { data: currentEpoch } = useCurrentEpoch();
  const { refetch: refetchHistory } = useHistory();
  const {
    data: userAllocationsOriginal,
    isFetching: isFetchingUserAllocation,
    refetch: refetchUserAllocations,
  } = useUserAllocations(undefined, { refetchOnMount: true });

  const userAllocations = userAllocationsOriginal && {
    ...userAllocationsOriginal,
    elements: userAllocationsOriginal.elements.map(element => ({
      ...element,
      value: formatUnits(element.value),
    })),
  };

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
  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations,
    setAllocations,
    userAllocationsElements: userAllocationsOriginal?.elements,
  });

  const allocateEvent = useAllocate({
    nonce: userNonce!,
    onSuccess: async () => {
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
          return allocationValue && allocationValue.value !== '0.0';
        }),
      ]);
      setCurrentView('summary');
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mutateAsyncAllocateSimulateDebounced = useCallback(
    debounce(
      _allocationValues => {
        resetAllocateSimulate();
        mutateAsyncAllocateSimulate(_allocationValues);
      },
      250,
      { trailing: true },
    ),
    [],
  );

  const setPercentageProportionsWrapper = (
    allocationValuesNew: AllocationValues,
    rewardsForProposalsNew: BigNumber,
  ) => {
    if (!individualReward) {
      return;
    }
    const percentageProportionsNew = allocationValuesNew.reduce((acc, curr) => {
      const valueAsPercentageOfRewardsForProposals =
        curr.value === '0'
          ? '0'
          : (
              (parseFloat(curr.value.toString()) * 100) /
              parseFloat(formatUnits(rewardsForProposalsNew))
            ).toFixed();
      return {
        ...acc,
        [curr.address]: valueAsPercentageOfRewardsForProposals,
      };
    }, {});
    setPercentageProportions(percentageProportionsNew);
  };

  const onResetAllocationValues = ({
    allocationValuesNew = allocationValues,
    rewardsForProposalsNew = rewardsForProposals,
    shouldReset = false,
  } = {}) => {
    if (
      isFetchingUserAllocation ||
      !isRewardsForProposalsSet ||
      currentEpoch === undefined ||
      (isConnected && !userAllocations && isDecisionWindowOpen && currentEpoch > 1) ||
      !rewardsForProposalsNew
    ) {
      return;
    }

    const allocationValuesNewSum = allocationValuesNew.reduce(
      (acc, curr) => acc.add(parseUnits(curr.value)),
      BigNumber.from(0),
    );
    const shouldIsManulModeBeChangedToFalse = allocationValuesNewSum.isZero();

    /**
     * Manual needs to be changed to false when values are 0.
     * Percentages cant be calculated from 0, equal split cant be maintained, causing the app to crash.
     * Mode needs to change to "auto".
     */
    if (shouldIsManulModeBeChangedToFalse) {
      setIsManualMode(false);
    }

    const allocationValuesReset = getAllocationValuesInitialState({
      allocationValues: allocationValuesNew,
      allocations,
      isManualMode: shouldIsManulModeBeChangedToFalse ? false : isManualMode,
      percentageProportions,
      rewardsForProposals: rewardsForProposalsNew,
      shouldReset,
      userAllocationsElements: isDecisionWindowOpen ? userAllocations?.elements || [] : [],
    });

    if (shouldReset) {
      const allocationValuesResetSum = allocationValuesReset.reduce(
        (acc, curr) => acc.add(parseUnits(curr.value)),
        BigNumber.from(0),
      );

      setRewardsForProposals(allocationValuesResetSum);
      setPercentageProportionsWrapper(allocationValuesReset, allocationValuesResetSum);

      const shouldIsManualModeBeChangedToFalseNew = allocationValuesResetSum.isZero();
      if (!shouldIsManualModeBeChangedToFalseNew) {
        setIsManualMode(userAllocations!.isManuallyEdited);
      } else {
        setIsManualMode(false);
      }
    }

    setAllocationValues(allocationValuesReset);
  };

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
        value: '0',
      });
    }
    allocateEvent.emit(allocationValuesNew, isManualMode);
  };

  useEffect(() => {
    if (!userAllocations || isManualMode) {
      return;
    }
    if (userAllocationsOriginal?.isManuallyEdited) {
      setIsManualMode(true);
      return;
    }
    setIsManualMode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAllocations?.isManuallyEdited]);

  useEffect(() => {
    if (!isRewardsForProposalsSet || isFetchingUserAllocation) {
      return;
    }

    if (userAllocations && userAllocations.elements.length > 0) {
      setAllocationValues(userAllocations.elements);
      setPercentageProportionsWrapper(userAllocations.elements, rewardsForProposals);
      onResetAllocationValues({ allocationValuesNew: userAllocations.elements });
      return;
    }
    onResetAllocationValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentEpoch,
    allocations,
    isRewardsForProposalsSet,
    isFetchingUserAllocation,
    userAllocations?.elements.length,
    userNonce,
    isRewardsForProposalsSet,
  ]);

  useEffect(() => {
    if (!currentEpoch || !isDecisionWindowOpen) {
      return;
    }
    if (userAllocations && currentEpoch > 1 && userAllocations.hasUserAlreadyDoneAllocation) {
      setCurrentView('summary');
      return;
    }
    setCurrentView('edit');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpoch, isDecisionWindowOpen, userAllocations?.elements.length]);

  useEffect(() => {
    const areAllValuesZero = !allocationValues.some(element => element.value !== '0.0');
    if (
      allocationValues.length === 0 ||
      areAllValuesZero ||
      addressesWithError.length > 0 ||
      !isDecisionWindowOpen
    ) {
      return;
    }
    mutateAsyncAllocateSimulateDebounced(allocationValues);
  }, [
    mutateAsyncAllocateSimulateDebounced,
    addressesWithError,
    allocationValues,
    isDecisionWindowOpen,
  ]);

  const onChangeAllocationItemValue = (
    newAllocationValue: AllocationValue,
    isManualModeEnforced = false,
  ) => {
    const { allocationValuesArrayNew, rewardsForProposalsNew } =
      getAllocationValuesAfterManualChange({
        allocationValues,
        individualReward,
        // When deleting by button isManualMode does not trigger manual mode. When typing, it does.
        isManualMode: isManualModeEnforced ? true : isManualMode,
        newAllocationValue: newAllocationValue || '0',
        rewardsForProposals,
        setAddressesWithError,
      });

    setAllocationValues(allocationValuesArrayNew);
    setRewardsForProposals(rewardsForProposalsNew);

    if (isManualModeEnforced) {
      setPercentageProportionsWrapper(allocationValuesArrayNew, rewardsForProposalsNew);
    }

    if (isManualModeEnforced) {
      setIsManualMode(true);
    }
  };

  const onRemoveAllocationElement = (address: string) => {
    const hasUserAllocatedToThisProject = userAllocations?.elements.find(
      element => element.address === address,
    );
    onAddRemoveFromAllocate(address);
    if (!hasUserAllocatedToThisProject) {
      onChangeAllocationItemValue({ address, value: '0' });
    }
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
    !isEpoch1 &&
    (areAllocationsAvailableOrAlreadyDone || rewardsForProposals.isZero()) &&
    hasUserIndividualReward &&
    isDecisionWindowOpen;

  return (
    <Layout
      dataTest="AllocationView"
      isLoading={isLoading}
      navigationBottomSuffix={
        showAllocationBottomNavigation && (
          <AllocationNavigation
            areButtonsDisabled={areButtonsDisabled}
            currentView={currentView}
            isLeftButtonDisabled={currentView === 'summary'}
            isLoading={allocateEvent.isLoading}
            onAllocate={onAllocate}
            onResetValues={() => onResetAllocationValues({ shouldReset: true })}
            setCurrentView={setCurrentView}
          />
        )
      }
    >
      <AllocationTipTiles className={styles.box} />
      {!isEpoch1 && (
        <AllocationRewardsBox
          className={styles.box}
          isDisabled={!isDecisionWindowOpen || !hasUserIndividualReward}
          isError={addressesWithError.length > 0}
          isLocked={currentView === 'summary'}
          isManuallyEdited={isManualMode}
          setRewardsForProposalsCallback={onResetAllocationValues}
        />
      )}
      {currentView === 'edit' ? (
        areAllocationsAvailableOrAlreadyDone && (
          <AnimatePresence initial={false}>
            {allocationsWithRewards.length > 0
              ? allocationsWithRewards!.map(
                  ({ address, isAllocatedTo, isLoadingError, value, profileImageSmall, name }) => (
                    <AllocationItem
                      key={address}
                      address={address}
                      className={styles.box}
                      isAllocatedTo={isAllocatedTo}
                      isError={addressesWithError.includes(address)}
                      isLoadingError={isLoadingError}
                      isThereAnyError={addressesWithError.length > 0}
                      name={name}
                      onChange={onChangeAllocationItemValue}
                      onRemoveAllocationElement={() => onRemoveAllocationElement(address)}
                      profileImageSmall={profileImageSmall}
                      rewardsProps={{
                        isLoadingAllocateSimulate,
                        simulatedMatched: allocationSimulated?.matched.find(
                          element => element.address === address,
                        )?.value,
                      }}
                      setAddressesWithError={setAddressesWithError}
                      value={value}
                    />
                  ),
                )
              : allocations.map(allocation => (
                  <AllocationItemSkeleton key={allocation} className={styles.box} />
                ))}
          </AnimatePresence>
        )
      ) : (
        <AllocationSummary
          allocationSimulated={allocationSimulated}
          isLoadingAllocateSimulate={isLoadingAllocateSimulate}
        />
      )}
    </Layout>
  );
};

export default AllocationView;
