import cx from 'classnames';
import { AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { SignatureOpType, apiGetPendingMultisigSignatures } from 'api/calls/multisigSignatures';
import AllocationItem from 'components/Allocation/AllocationItem';
import AllocationItemSkeleton from 'components/Allocation/AllocationItemSkeleton';
import AllocationNavigation from 'components/Allocation/AllocationNavigation';
import AllocationRewardsBox from 'components/Allocation/AllocationRewardsBox';
import AllocationSummary from 'components/Allocation/AllocationSummary';
import AllocationTipTiles from 'components/Allocation/AllocationTipTiles';
import ModalAllocationLowUqScore from 'components/Allocation/ModalAllocationLowUqScore';
import Layout from 'components/shared/Layout';
import useAllocate from 'hooks/events/useAllocate';
import useAllocationViewSetRewardsForProjects from 'hooks/helpers/useAllocationViewSetRewardsForProjects';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useAllocateSimulate from 'hooks/mutations/useAllocateSimulate';
import useProjectsDonors from 'hooks/queries/donors/useProjectsDonors';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useHistory from 'hooks/queries/useHistory';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsContract from 'hooks/queries/useIsContract';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useProjectsIpfsWithRewards from 'hooks/queries/useProjectsIpfsWithRewards';
import useUpcomingBudget from 'hooks/queries/useUpcomingBudget';
import useUqScore from 'hooks/queries/useUqScore';
import useUserAllocationNonce from 'hooks/queries/useUserAllocationNonce';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import toastService from 'services/toastService';
import useAllocationsStore from 'store/allocations/store';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

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
  const { data: projectsEpoch } = useProjectsEpoch();
  const { refetch: refetchProjectsDonors } = useProjectsDonors();
  const { data: projectsIpfsWithRewards } = useProjectsIpfsWithRewards();
  const { isRewardsForProjectsSet } = useAllocationViewSetRewardsForProjects();
  const [isWaitingForFirstMultisigSignature, setIsWaitingForFirstMultisigSignature] =
    useState(false);
  const {
    data: allocationSimulated,
    mutateAsync: mutateAsyncAllocateSimulate,
    isPending: isLoadingAllocateSimulate,
    reset: resetAllocateSimulate,
  } = useAllocateSimulate();
  const [isWaitingForAllMultisigSignatures, setIsWaitingForAllMultisigSignatures] = useState(false);
  const { isFetching: isFetchingUpcomingBudget, isRefetching: isRefetchingUpcomingBudget } =
    useUpcomingBudget();
  const { data: isContract } = useIsContract();
  const { address: walletAddress } = useAccount();

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
      value: formatUnitsBigInt(element.value),
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
  const { data: uqScore } = useUqScore(currentEpoch!);
  const { refetch: refetchMatchedProjectRewards } = useMatchedProjectRewards();
  const [showLowUQScoreModal, setShowLowUQScoreModal] = useState(false);
  const {
    allocations,
    rewardsForProjects,
    setAllocations,
    addAllocations,
    removeAllocations,
    setRewardsForProjects,
  } = useAllocationsStore(state => ({
    addAllocations: state.addAllocations,
    allocations: state.data.allocations,
    removeAllocations: state.removeAllocations,
    rewardsForProjects: state.data.rewardsForProjects,
    setAllocations: state.setAllocations,
    setRewardsForProjects: state.setRewardsForProjects,
  }));
  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    addAllocations,
    allocations,
    isDecisionWindowOpen,
    removeAllocations,
    userAllocationsElements: userAllocationsOriginal?.elements,
  });

  const onAllocateSuccess = () => {
    toastService.showToast({
      name: 'allocationSuccessful',
      title: t('allocationSuccessful'),
    });
    refetchMatchedProjectRewards();
    refetchUserAllocations();
    refetchUserAllocationNonce();
    refetchHistory();
    refetchWithdrawals();
    refetchProjectsDonors();
    setAllocations([
      ...allocations.filter(allocation => {
        const allocationValue = allocationValues.find(({ address }) => address === allocation);
        return allocationValue && allocationValue.value !== '0';
      }),
    ]);
    setCurrentView('summary');
  };

  const allocateEvent = useAllocate({
    nonce: userNonce!,
    onMultisigMessageSign: () => {
      toastService.hideToast('allocationMultisigInitialSignature');
      setIsWaitingForFirstMultisigSignature(false);
      setIsWaitingForAllMultisigSignatures(true);
    },
    onSuccess: onAllocateSuccess,
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
    rewardsForProjectsNew: bigint,
  ) => {
    if (!individualReward) {
      return;
    }
    const percentageProportionsNew = allocationValuesNew.reduce((acc, curr) => {
      const valueAsPercentageOfRewardsForProjects = ['0', ''].includes(curr.value) // 0 from the user, empty when removed entirely.
        ? '0'
        : (
            (parseFloat(curr.value.toString()) * 100) /
            parseFloat(formatUnitsBigInt(rewardsForProjectsNew))
          ).toFixed();
      return {
        ...acc,
        [curr.address]: valueAsPercentageOfRewardsForProjects,
      };
    }, {});
    setPercentageProportions(percentageProportionsNew);
  };

  const onResetAllocationValues = ({
    allocationValuesNew = allocationValues,
    rewardsForProjectsNew = rewardsForProjects,
    shouldReset = false,
  } = {}) => {
    if (
      isFetchingUserAllocation ||
      !isRewardsForProjectsSet ||
      currentEpoch === undefined ||
      (isConnected && !userAllocations && isDecisionWindowOpen && currentEpoch > 1)
    ) {
      return;
    }

    const userAllocationsAddresses = userAllocations?.elements.map(({ address }) => address);
    if (shouldReset && userAllocationsAddresses) {
      const userAllocationsAddressesToAdd = userAllocationsAddresses?.filter(
        element => !allocations.includes(element),
      );

      userAllocationsAddressesToAdd?.forEach((element, index, array) => {
        onAddRemoveFromAllocate(element, [...allocations, ...array.slice(0, index)]);
      });
    }

    const allocationValuesNewSum = allocationValuesNew.reduce(
      (acc, curr) => acc + parseUnitsBigInt(curr.value),
      BigInt(0),
    );
    const shouldIsManulModeBeChangedToFalse = allocationValuesNewSum === 0n;

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
      allocations:
        shouldReset && userAllocationsAddresses
          ? [...new Set([...allocations, ...userAllocationsAddresses])]
          : allocations,
      isManualMode: shouldIsManulModeBeChangedToFalse ? false : isManualMode,
      percentageProportions,
      rewardsForProjects: rewardsForProjectsNew,
      shouldReset,
      userAllocationsElements: isDecisionWindowOpen ? userAllocations?.elements || [] : [],
    });

    if (shouldReset) {
      const allocationValuesResetSum = allocationValuesReset.reduce(
        (acc, curr) => acc + parseUnitsBigInt(curr.value),
        BigInt(0),
      );

      setRewardsForProjects(allocationValuesResetSum);
      setPercentageProportionsWrapper(allocationValuesReset, allocationValuesResetSum);

      const shouldIsManualModeBeChangedToFalseNew = allocationValuesResetSum === 0n;
      if (!shouldIsManualModeBeChangedToFalseNew) {
        setIsManualMode(userAllocations!.isManuallyEdited);
      } else {
        setIsManualMode(false);
      }
    }

    setAllocationValues(allocationValuesReset);
  };

  const onAllocate = (isProceedingToAllocateWithLowUQScore?: boolean) => {
    if (userNonce === undefined || projectsEpoch === undefined) {
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
        address: projectsEpoch.projectsAddresses[0],
        value: '0',
      });
    }
    if (isContract && !isProceedingToAllocateWithLowUQScore) {
      setIsWaitingForFirstMultisigSignature(true);
      toastService.showToast({
        message: t('multisigSignatureToast.message'),
        name: 'allocationMultisigInitialSignature',
        title: t('multisigSignatureToast.title'),
        type: 'warning',
      });
    }
    if (
      !userAllocations?.hasUserAlreadyDoneAllocation &&
      uqScore === 20n &&
      !isProceedingToAllocateWithLowUQScore
    ) {
      setShowLowUQScoreModal(true);
      return;
    }
    if (isProceedingToAllocateWithLowUQScore) {
      setShowLowUQScoreModal(false);
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
    if (!isRewardsForProjectsSet || isFetchingUserAllocation) {
      return;
    }

    if (userAllocations && userAllocations.elements.length > 0) {
      setAllocationValues(userAllocations.elements);
      setPercentageProportionsWrapper(userAllocations.elements, rewardsForProjects);
      onResetAllocationValues({ allocationValuesNew: userAllocations.elements });
      return;
    }
    onResetAllocationValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentEpoch,
    allocations,
    isRewardsForProjectsSet,
    isFetchingUserAllocation,
    userAllocations?.elements.length,
    userNonce,
    isRewardsForProjectsSet,
  ]);

  useEffect(() => {
    if (
      !currentEpoch ||
      !isDecisionWindowOpen ||
      !userAllocations ||
      currentEpoch < 2 ||
      !userAllocations.hasUserAlreadyDoneAllocation
    ) {
      return;
    }
    const userAllocationsAddresses = userAllocations.elements.map(({ address }) => address);
    /**
     * Whenever user did an allocation and removed/unhearted project they previously allocated to,
     * land on edit.
     *
     * Otherwise, land on summary.
     */
    if (allocations.length < userAllocationsAddresses.length) {
      setCurrentView('edit');
      return;
    }
    setCurrentView('summary');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpoch, isDecisionWindowOpen, userAllocations?.elements.length]);

  useEffect(() => {
    const areAllValuesZero = !allocationValues.some(element => element.value !== '0.0');
    if (
      allocationValues.length === 0 ||
      areAllValuesZero ||
      addressesWithError.length > 0 ||
      !isDecisionWindowOpen ||
      !isConnected
    ) {
      return;
    }
    mutateAsyncAllocateSimulateDebounced(
      currentView === 'edit' ? allocationValues : userAllocations?.elements,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentView,
    mutateAsyncAllocateSimulateDebounced,
    addressesWithError,
    allocationValues,
    isDecisionWindowOpen,
    userAllocations?.elements?.length,
    userNonce,
  ]);

  const onChangeAllocationItemValue = (
    newAllocationValue: AllocationValue,
    isManualModeEnforced = false,
  ) => {
    const { allocationValuesArrayNew, rewardsForProjectsNew } =
      getAllocationValuesAfterManualChange({
        allocationValues,
        individualReward,
        // When deleting by button isManualMode does not trigger manual mode. When typing, it does.
        isManualMode: isManualModeEnforced ? true : isManualMode,
        newAllocationValue: newAllocationValue || '0',
        rewardsForProjects,
        setAddressesWithError,
      });

    setAllocationValues(allocationValuesArrayNew);
    setRewardsForProjects(rewardsForProjectsNew);

    if (isManualModeEnforced) {
      setPercentageProportionsWrapper(allocationValuesArrayNew, rewardsForProjectsNew);
    }

    if (isManualModeEnforced) {
      setIsManualMode(true);
    }
  };

  const onRemoveAllocationElement = (address: string) => {
    onAddRemoveFromAllocate(address);
    onChangeAllocationItemValue({ address, value: '0' });
  };

  const isLoading =
    allocationValues === undefined ||
    (isConnected && isFetchingUserNonce) ||
    (isConnected && isFetchingUserAllocation) ||
    (isFetchingUpcomingBudget && !isRefetchingUpcomingBudget);

  const areAllocationsAvailableOrAlreadyDone =
    (allocationValues !== undefined && !isEmpty(allocations)) ||
    (!!userAllocations?.hasUserAlreadyDoneAllocation && userAllocations.elements.length > 0);
  const hasUserIndividualReward = !!individualReward && individualReward !== 0n;
  const areButtonsDisabled =
    isLoading ||
    !isConnected ||
    !isDecisionWindowOpen ||
    (!areAllocationsAvailableOrAlreadyDone && rewardsForProjects !== 0n) ||
    !individualReward ||
    isWaitingForFirstMultisigSignature;

  const allocationsWithRewards = getAllocationsWithRewards({
    allocationValues,
    areAllocationsAvailableOrAlreadyDone,
    projectsIpfsWithRewards,
    userAllocationsElements: userAllocations?.elements,
  });

  const isEpoch1 = currentEpoch === 1;

  const showAllocationBottomNavigation =
    !isEpoch1 &&
    (areAllocationsAvailableOrAlreadyDone || rewardsForProjects === 0n) &&
    hasUserIndividualReward &&
    isDecisionWindowOpen;

  useEffect(() => {
    if (!walletAddress || !isContract || isWaitingForFirstMultisigSignature) {
      return;
    }
    const getPendingMultisigSignatures = () => {
      apiGetPendingMultisigSignatures(walletAddress!, SignatureOpType.ALLOCATION).then(data => {
        if (isWaitingForAllMultisigSignatures && !data.hash) {
          onAllocateSuccess();
        }
        setIsWaitingForAllMultisigSignatures(!!data.hash);
      });
    };

    if (!isWaitingForAllMultisigSignatures) {
      getPendingMultisigSignatures();
      return;
    }

    const intervalId = setInterval(getPendingMultisigSignatures, 2500);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    walletAddress,
    isWaitingForAllMultisigSignatures,
    isContract,
    isWaitingForFirstMultisigSignature,
  ]);

  return (
    <Layout
      classNameBody={cx(
        styles.body,
        (isWaitingForAllMultisigSignatures || isWaitingForFirstMultisigSignature) &&
          styles.isWaitingForAllMultisigSignatures,
      )}
      dataTest="AllocationView"
      isLoading={isLoading}
      navigationBottomSuffix={
        showAllocationBottomNavigation && (
          <AllocationNavigation
            areButtonsDisabled={areButtonsDisabled}
            currentView={currentView}
            isLeftButtonDisabled={
              currentView === 'summary' ||
              isWaitingForAllMultisigSignatures ||
              isWaitingForFirstMultisigSignature
            }
            isLoading={
              allocateEvent.isLoading ||
              isWaitingForAllMultisigSignatures ||
              isWaitingForFirstMultisigSignature
            }
            isWaitingForAllMultisigSignatures={
              isWaitingForAllMultisigSignatures || isWaitingForFirstMultisigSignature
            }
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
          setRewardsForProjectsCallback={onResetAllocationValues}
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
      <ModalAllocationLowUqScore
        modalProps={{
          isOpen: showLowUQScoreModal,
          onClosePanel: () => setShowLowUQScoreModal(false),
        }}
        onAllocate={() => onAllocate(true)}
      />
    </Layout>
  );
};

export default AllocationView;
