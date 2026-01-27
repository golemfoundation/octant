import cx from 'classnames';
import { AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { SignatureOpType, apiGetPendingMultisigSignatures } from 'api/calls/multisigSignatures';
import AllocationItem from 'components/Allocation/AllocationItem';
import AllocationItemSkeleton from 'components/Allocation/AllocationItemSkeleton';
import AllocationNavigation from 'components/Allocation/AllocationNavigation';
import AllocationRewardsBox from 'components/Allocation/AllocationRewardsBox';
import AllocationSummary from 'components/Allocation/AllocationSummary';
import ModalAllocationLowUqScore from 'components/Allocation/ModalAllocationLowUqScore';
import ModalMigration from 'components/Home/ModalMigration';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import { DRAWER_TRANSITION_TIME } from 'constants/animations';
import { LAYOUT_NAVBAR_ID } from 'constants/domElementsIds';
import { UQ_MULTIPLIER_FOR_USERS_BELOW_THRESHOLD_FOR_LEVERAGE_1 } from 'constants/uq';
import useAllocate from 'hooks/events/useAllocate';
import useAllocationViewSetRewardsForProjects from 'hooks/helpers/useAllocationViewSetRewardsForProjects';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIsMigrationMode from 'hooks/helpers/useIsMigrationMode';
import useIsUserMigrationDone from 'hooks/helpers/useIsUserMigrationDone';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useAllocateSimulate from 'hooks/mutations/useAllocateSimulate';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useEpochAllocations from 'hooks/queries/useEpochAllocations';
import useHistory from 'hooks/queries/useHistory';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsGnosisSafeMultisig from 'hooks/queries/useIsGnosisSafeMultisig';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useProjectsIpfsWithRewards from 'hooks/queries/useProjectsIpfsWithRewards';
import useUpcomingBudget from 'hooks/queries/useUpcomingBudget';
import useUqScore from 'hooks/queries/useUqScore';
import useUserAllocationNonce from 'hooks/queries/useUserAllocationNonce';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import toastService from 'services/toastService';
import useAllocationsStore from 'store/allocations/store';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './Allocation.module.scss';
import AllocationSliderBox from './AllocationSliderBox';
import AllocationProps, { AllocationValue, AllocationValues, PercentageProportions } from './types';
import {
  getAllocationValuesInitialState,
  getAllocationsWithRewards,
  getAllocationValuesAfterManualChange,
} from './utils';

const Allocation: FC<AllocationProps> = ({ dataTest }) => {
  const { isConnected } = useAccount();
  const keyPrefix = 'components.allocation';
  const { t } = useTranslation('translation', { keyPrefix });
  const [allocationValues, setAllocationValues] = useState<AllocationValues>([]);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [addressesWithError, setAddressesWithError] = useState<string[]>([]);
  const [percentageProportions, setPercentageProportions] = useState<PercentageProportions>({});
  const { data: projectsEpoch } = useProjectsEpoch();
  const { data: projectsIpfsWithRewards } = useProjectsIpfsWithRewards();
  const { data: isUserMigrationDone } = useIsUserMigrationDone();
  const [isModalMigrateOpen, setIsModalMigrateOpen] = useState<boolean>(false);
  const isInMigrationMode = useIsMigrationMode();
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
  const { data: isGnosisSafeMultisig } = useIsGnosisSafeMultisig();
  const { address: walletAddress } = useAccount();
  const [showAllocationNav, setShowAllocationNav] = useState(false);
  const [isEmptyStateImageVisible, setIsEmptyStateImageVisible] = useState(true);

  const navRef = useRef(document.getElementById(LAYOUT_NAVBAR_ID));
  const boxesWrapperRef = useRef(null);
  const allocationEmptyStateRef = useRef<HTMLDivElement>(null);
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

  const dataTestRoot = dataTest ?? 'Allocation';

  const { data: individualReward } = useIndividualReward();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { refetch: refetchWithdrawals } = useWithdrawals();
  const {
    data: userNonce,
    isFetching: isFetchingUserNonce,
    refetch: refetchUserAllocationNonce,
  } = useUserAllocationNonce();
  const {
    mutateAsync: refreshAntisybilStatus,
    isPending: isPendingRefreshAntisybilStatus,
    isSuccess: isSuccessRefreshAntisybilStatus,
    error: refreshAntisybilStatusError,
  } = useRefreshAntisybilStatus();
  const { data: uqScore, isFetching: isFetchingUqScore } = useUqScore(currentEpoch!, {
    enabled:
      isSuccessRefreshAntisybilStatus ||
      (refreshAntisybilStatusError as null | { message: string })?.message ===
        'Address is already used for delegation',
  });
  const { refetch: refetchMatchedProjectRewards } = useMatchedProjectRewards();
  const [showLowUQScoreModal, setShowLowUQScoreModal] = useState(false);
  const { refetch: refetchEpochAllocations } = useEpochAllocations(
    isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!,
    {
      enabled: isDecisionWindowOpen === true,
    },
  );
  const { isMobile, isTablet, isDesktop } = useMediaQuery();

  const {
    currentView,
    setCurrentView,
    allocations,
    rewardsForProjects,
    setAllocations,
    addAllocations,
    removeAllocations,
    setRewardsForProjects,
  } = useAllocationsStore(state => ({
    addAllocations: state.addAllocations,
    allocations: state.data.allocations,
    currentView: state.data.currentView,
    removeAllocations: state.removeAllocations,
    rewardsForProjects: state.data.rewardsForProjects,
    setAllocations: state.setAllocations,
    setCurrentView: state.setCurrentView,
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
    refetchMatchedProjectRewards();
    refetchUserAllocations();
    refetchUserAllocationNonce();
    refetchHistory();
    refetchWithdrawals();
    refetchEpochAllocations();
    toastService.hideToast('confirmChanges');
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

    // In migration mode there is no timeout list, but just for sure -- skip low uq logic.
    if (!isInMigrationMode) {
      if (
        !userAllocations?.hasUserAlreadyDoneAllocation &&
        uqScore === UQ_MULTIPLIER_FOR_USERS_BELOW_THRESHOLD_FOR_LEVERAGE_1 &&
        !isProceedingToAllocateWithLowUQScore
      ) {
        setShowLowUQScoreModal(true);
        return;
      }

      if (isProceedingToAllocateWithLowUQScore) {
        setShowLowUQScoreModal(false);
      }
    }

    // this condition must always be last due to ModalAllocationLowUqScore
    // if uqScore == 1n, the signature request is triggered in ModalAllocationLowUqScore
    if (isGnosisSafeMultisig) {
      setIsWaitingForFirstMultisigSignature(true);
      toastService.showToast({
        message: t('multisigSignatureToast.message'),
        name: 'allocationMultisigInitialSignature',
        title: t('multisigSignatureToast.title'),
        type: 'warning',
      });
    }
    allocateEvent.emit(allocationValuesNew, isManualMode);

    if (isUserMigrationDone) {
      return;
    }

    setIsModalMigrateOpen(true);
  };

  useEffect(() => {
    if (!walletAddress) {
      return;
    }
    /**
     * The initial value of UQ for every user is 0.01.
     * It does not update automatically after delegation nor after change in Gitcoin Passport itself.
     *
     * We need to refreshAntisybilStatus to force BE to refetch current values from Gitcoin Passport
     * and return true value.
     */
    refreshAntisybilStatus(walletAddress!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    return () => {
      if (!isDecisionWindowOpen || allocations.length < userAllocationsAddresses.length) {
        return;
      }
      setCurrentView('summary');
    };
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

  useEffect(() => {
    if (currentView) {
      return;
    }

    if (userAllocations?.hasUserAlreadyDoneAllocation) {
      setCurrentView('summary');
    } else {
      setCurrentView('edit');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, userAllocations?.hasUserAlreadyDoneAllocation]);

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
    (isConnected && isPendingRefreshAntisybilStatus) ||
    (isConnected && isFetchingUqScore) ||
    (isFetchingUpcomingBudget && !isRefetchingUpcomingBudget);

  const areAllocationsAvailableOrAlreadyDone =
    (allocationValues !== undefined && !isEmpty(allocations)) ||
    (!!userAllocations?.hasUserAlreadyDoneAllocation && userAllocations.elements.length > 0);
  const hasUserIndividualReward = !!individualReward && individualReward !== 0n;

  const emptyStateI18nKey = useMemo(() => {
    if (hasUserIndividualReward && isDecisionWindowOpen) {
      if (isMobile) {
        return `${keyPrefix}.emptyStateMobileAWOpen`;
      }
      return `${keyPrefix}.emptyStateAWOpen`;
    }

    if (isMobile) {
      return `${keyPrefix}.emptyStateMobile`;
    }

    return `${keyPrefix}.emptyState`;
  }, [hasUserIndividualReward, isDecisionWindowOpen, isMobile]);

  const allocationsWithRewards = getAllocationsWithRewards({
    allocationValues,
    areAllocationsAvailableOrAlreadyDone,
    projectsIpfsWithRewards,
    userAllocationsElements: userAllocations?.elements,
  });

  const isEpoch1 = currentEpoch === 1;

  const areButtonsDisabled =
    isEpoch1 ||
    isLoading ||
    !isConnected ||
    !isDecisionWindowOpen ||
    (!areAllocationsAvailableOrAlreadyDone && rewardsForProjects !== 0n) ||
    !hasUserIndividualReward ||
    isWaitingForFirstMultisigSignature;

  useEffect(() => {
    if (!walletAddress || !isGnosisSafeMultisig || isWaitingForFirstMultisigSignature) {
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
    isGnosisSafeMultisig,
    isWaitingForFirstMultisigSignature,
  ]);

  useEffect(() => {
    if (isDesktop) {
      setTimeout(() => {
        setShowAllocationNav(true);
      }, DRAWER_TRANSITION_TIME * 1000);
    } else {
      setShowAllocationNav(true);
    }

    return () => {
      setShowAllocationNav(false);
    };
  }, [isDesktop]);

  useEffect(() => {
    navRef.current = document.getElementById(LAYOUT_NAVBAR_ID);
  }, []);

  useEffect(() => {
    if (!allocationEmptyStateRef.current || allocations.length) {
      return;
    }
    const { height } = allocationEmptyStateRef.current.getBoundingClientRect();

    // 200 px (mobile) / 226px (tablet, desktop, large desktop) -> min height of emptyState box to show image + text
    if (height < (isMobile ? 200 : 226)) {
      setIsEmptyStateImageVisible(false);
      return;
    }

    setIsEmptyStateImageVisible(true);
  }, [allocations.length, isMobile, isTablet]);

  return (
    <>
      <div className={styles.root} data-test={dataTestRoot}>
        <div className={styles.title}>
          {t(isInMigrationMode ? 'migration.title' : 'allocationList')}
        </div>
        <div
          ref={boxesWrapperRef}
          className={cx(
            styles.boxesWrapper,
            isDesktop && styles.withMarginBottom,
            isDesktop && allocations.length && styles.withPaddingBottom,
          )}
        >
          {isInMigrationMode && <div className={styles.note}>{t('migration.note')}</div>}
          {!isEpoch1 && (
            <AllocationRewardsBox
              isDisabled={!isDecisionWindowOpen || !hasUserIndividualReward}
              isLocked={currentView === 'summary'}
              isManuallyEdited={isManualMode}
            />
          )}
          {hasUserIndividualReward && isDecisionWindowOpen && !isEpoch1 && (
            <AllocationSliderBox
              className={styles.box}
              isDisabled={!isDecisionWindowOpen || !hasUserIndividualReward}
              isError={addressesWithError.length > 0}
              isLocked={currentView === 'summary'}
              setRewardsForProjectsCallback={onResetAllocationValues}
            />
          )}
          {!allocations.length && currentView === 'edit' && (
            <div
              ref={allocationEmptyStateRef}
              className={styles.emptyState}
              data-test={`${dataTestRoot}__emptyState`}
            >
              {isEmptyStateImageVisible && (
                <Img className={styles.emptyStateImage} src="/images/window-with-dog.webp" />
              )}
              <div className={styles.emptyStateText}>
                <Trans
                  components={[
                    <Button
                      className={styles.projectsLink}
                      to={ROOT_ROUTES.projects.absolute}
                      variant="link3"
                    />,
                  ]}
                  i18nKey={emptyStateI18nKey}
                />
              </div>
            </div>
          )}

          {currentView === 'edit' ? (
            areAllocationsAvailableOrAlreadyDone && (
              <AnimatePresence initial={false}>
                {allocationsWithRewards.length > 0
                  ? allocationsWithRewards!.map(
                      ({
                        address,
                        isAllocatedTo,
                        isLoadingError,
                        value,
                        profileImageSmall,
                        name,
                      }) => (
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
          {showAllocationNav &&
            (isDesktop ? boxesWrapperRef.current : navRef.current) &&
            createPortal(
              <AllocationNavigation
                areButtonsDisabled={areButtonsDisabled}
                isLeftButtonDisabled={
                  currentView === 'summary' ||
                  isWaitingForAllMultisigSignatures ||
                  isWaitingForFirstMultisigSignature
                }
                isLoading={
                  !areButtonsDisabled &&
                  (allocateEvent.isLoading ||
                    isWaitingForAllMultisigSignatures ||
                    isWaitingForFirstMultisigSignature ||
                    isLoading)
                }
                isWaitingForAllMultisigSignatures={
                  isWaitingForAllMultisigSignatures || isWaitingForFirstMultisigSignature
                }
                onAllocate={onAllocate}
                onResetValues={() => onResetAllocationValues({ shouldReset: true })}
              />,
              isDesktop ? boxesWrapperRef.current! : navRef.current!,
            )}
        </div>
      </div>
      <ModalMigration
        modalProps={{
          dataTest: 'ModalMigration',
          isOpen: isModalMigrateOpen,
          onClosePanel: () => setIsModalMigrateOpen(false),
        }}
      />
    </>
  );
};

export default Allocation;
