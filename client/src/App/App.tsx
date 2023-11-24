import { useQueryClient } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';
import React, { ReactElement, useEffect, useState } from 'react';
import { useAccount, useConnect, useNetwork } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';

import AppLoader from 'components/dedicated/AppLoader/AppLoader';
import ModalOnboarding from 'components/dedicated/ModalOnboarding/ModalOnboarding';
import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import networkConfig from 'constants/networkConfig';
import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from 'hooks/helpers/useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';
import useAvailableFundsEth from 'hooks/helpers/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useManageTransactionsPending from 'hooks/helpers/useManageTransactionsPending';
import useAllProposals from 'hooks/queries/useAllProposals';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useSyncStatus, { Response } from 'hooks/queries/useSyncStatus';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useUserTOS from 'hooks/queries/useUserTOS';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import localStorageService from 'services/localStorageService';
import useAllocationsStore from 'store/allocations/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';
import getValidatedProposalsFromLocalStorage from 'utils/getValidatedProposalsFromLocalStorage';
import triggerToast from 'utils/triggerToast';

import 'styles/index.scss';
import 'i18n';

const App = (): ReactElement => {
  useManageTransactionsPending();
  const { chain } = useNetwork();
  const {
    allocations,
    setAllocations,
    addAllocations,
    isAllocationsInitialized,
    reset: resetAllocationsStore,
  } = useAllocationsStore(state => ({
    addAllocations: state.addAllocations,
    allocations: state.data.allocations,
    isAllocationsInitialized: state.meta.isInitialized,
    reset: state.reset,
    setAllocations: state.setAllocations,
  }));
  const {
    setValuesFromLocalStorage: setValuesFromLocalStorageTips,
    isInitialized: isTipsStoreInitialized,
    setInitialState: setInitialStateTips,
  } = useTipsStore(({ meta, setValuesFromLocalStorage, setInitialState }) => ({
    isInitialized: meta.isInitialized,
    setInitialState,
    setValuesFromLocalStorage,
  }));
  const {
    areOctantTipsAlwaysVisible,
    displayCurrency,
    isSettingsInitialized,
    setValuesFromLocalStorageSettings,
    setIsCryptoMainValueDisplay,
  } = useSettingsStore(state => ({
    areOctantTipsAlwaysVisible: state.data.areOctantTipsAlwaysVisible,
    displayCurrency: state.data.displayCurrency,
    isSettingsInitialized: state.meta.isInitialized,
    setIsCryptoMainValueDisplay: state.setIsCryptoMainValueDisplay,
    setValuesFromLocalStorageSettings: state.setValuesFromLocalStorage,
  }));
  const {
    isInitialized: isOnboardingInitialized,
    setValuesFromLocalStorage: setValuesFromLocalStorageOnboarding,
  } = useOnboardingStore(state => ({
    isInitialized: state.meta.isInitialized,
    setValuesFromLocalStorage: state.setValuesFromLocalStorage,
  }));
  const { reset: resetTransactionLocalStore } = useTransactionLocalStore(state => ({
    reset: state.reset,
  }));
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  useCryptoValues(displayCurrency, {
    onError: () => {
      setIsCryptoMainValueDisplay(true);
    },
  });
  const { data: currentEpoch, isLoading: isLoadingCurrentEpoch } = useCurrentEpoch({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: proposals } = useProposalsContract();
  const { isFetching: isFetchingAllProposals } = useAllProposals();
  const { data: userAllocations } = useUserAllocations();
  const { isFetching: isFetchingPatronModeStatus } = useIsPatronMode();
  const {
    data: areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    isLoading: isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow,
  } = useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow();
  const [isFlushRequired, setIsFlushRequired] = useState(false);
  const isProjectAdminMode = useIsProjectAdminMode();
  const [isConnectedLocal, setIsConnectedLocal] = useState<boolean>(false);
  const [currentAddressLocal, setCurrentAddressLocal] = useState<string | null>(null);
  const [currentEpochLocal, setCurrentEpochLocal] = useState<number | null>(null);
  const [isDecisionWindowOpenLocal, setIsDecisionWindowOpenLocal] = useState<boolean | null>(null);
  const [syncStatusLocal, setSyncStatusLocal] = useState<Response | null>(null);
  const [chainIdLocal, setChainIdLocal] = useState<number | null>(null);
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const { isFetching: isFetchingUserTOS } = useUserTOS();
  const isSyncingInProgress = syncStatusLocal?.pendingSnapshot === 'in_progress';
  const { data: syncStatus } = useSyncStatus({
    refetchInterval: isSyncingInProgress ? 5000 : false,
  });
  const { reset } = useConnect();
  const { refetch: refetchAvailableFundsEth } = useAvailableFundsEth();
  const { refetch: refetchAvailableFundsGlm } = useAvailableFundsGlm();

  const initializeStore = (shouldDoReset = false) => {
    // Store is populated with data from LS, hence init here.
    localStorageService.init();
    setValuesFromLocalStorageSettings();
    setValuesFromLocalStorageOnboarding();
    setValuesFromLocalStorageTips();

    // On init load reset is not required, when changing account -- yes.
    if (shouldDoReset) {
      resetAllocationsStore();
      resetTransactionLocalStore();
    }
  };

  useEffect(() => {
    if (chainIdLocal && chainIdLocal !== networkConfig.id) {
      triggerToast({
        message: `Please change network to ${networkConfig.name}${
          networkConfig.isTestnet ? ' testnet' : ''
        }`,
        title: 'Wrong network',
        type: 'error',
      });
    }
  }, [chainIdLocal]);

  useEffect(() => {
    // Possible solution for invalid cached `isConnect` value. This snippet resets data from `useConnect` hook and try ty refetch wallet balance (eth + glm) when wallet is disconnected and app still has old data in cache (query cache update).
    if (isConnected) {
      reset();
      refetchAvailableFundsEth();
      refetchAvailableFundsGlm();
    }
    initializeStore();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (syncStatus && !isEqual(syncStatus, syncStatusLocal)) {
      setSyncStatusLocal(syncStatus);
    }
  }, [syncStatus, syncStatusLocal, setSyncStatusLocal]);

  useEffect(() => {
    if (chain && chain.id && chain.id !== chainIdLocal) {
      setChainIdLocal(chain.id);
    }
  }, [chain, chainIdLocal, setChainIdLocal]);

  useEffect(() => {
    if (isConnected !== isConnectedLocal) {
      setIsConnectedLocal(isConnected);
    }
    /**
     * When user signs out of the app and only then, initialize store.
     * TODO OCT-1022: simplify entire logic of flushing and reset.
     */
    if (!isConnected && isConnectedLocal) {
      initializeStore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isConnectedLocal, setIsConnectedLocal]);

  useEffect(() => {
    if (address && address !== currentAddressLocal) {
      setCurrentAddressLocal(address);
    }
  }, [address, currentAddressLocal, setCurrentAddressLocal]);

  useEffect(() => {
    if (currentEpoch && currentEpoch !== currentEpochLocal) {
      setCurrentEpochLocal(currentEpoch);
    }
  }, [currentEpoch, currentEpochLocal, setCurrentEpochLocal]);

  useEffect(() => {
    if (isDecisionWindowOpen && isDecisionWindowOpen !== isDecisionWindowOpenLocal) {
      setIsDecisionWindowOpenLocal(isDecisionWindowOpen);
    }
  }, [isDecisionWindowOpen, isDecisionWindowOpenLocal, setIsDecisionWindowOpenLocal]);

  useEffect(() => {
    const doesAddressRequireFlush =
      !!address && !!currentAddressLocal && address !== currentAddressLocal;
    const doesChainIdRequireFlush = chain && chain.id && chain.id !== chainIdLocal;
    const doesCurrentEpochRequireFlush =
      !!currentEpoch && !!currentEpochLocal && currentEpoch !== currentEpochLocal;
    const doesIsConnectedRequireFlush = !isConnected && isConnectedLocal;
    const doesIsDecisionWindowOpenRequireFlush =
      !!isDecisionWindowOpen &&
      !!isDecisionWindowOpenLocal &&
      isDecisionWindowOpen !== isDecisionWindowOpenLocal;
    const doesSyncStatusRequireFlush =
      !!syncStatus && !!syncStatusLocal && !isEqual(syncStatus, syncStatusLocal);
    if (
      doesAddressRequireFlush ||
      doesChainIdRequireFlush ||
      doesCurrentEpochRequireFlush ||
      doesIsConnectedRequireFlush ||
      doesIsDecisionWindowOpenRequireFlush ||
      doesSyncStatusRequireFlush
    ) {
      setIsFlushRequired(true);
    }
  }, [
    isConnected,
    isConnectedLocal,
    address,
    chain,
    chainIdLocal,
    currentAddressLocal,
    currentEpoch,
    currentEpochLocal,
    isDecisionWindowOpen,
    isDecisionWindowOpenLocal,
    queryClient,
    syncStatus,
    syncStatusLocal,
  ]);

  useEffect(() => {
    (() => {
      if (isFlushRequired) {
        queryClient.clear();
        queryClient.refetchQueries().then(() => {
          setIsFlushRequired(false);
        });
      }
    })();
  }, [isFlushRequired, setIsFlushRequired, queryClient]);

  useEffect(() => {
    /**
     * This hook validates allocations in localStorage
     * and populates store with them or sets empty array.
     */
    if (
      !proposals ||
      proposals.length === 0 ||
      isAllocationsInitialized ||
      isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow
    ) {
      return;
    }

    /**
     * When areCurrentEpochsProjectsHiddenOutsideAllocationWindow we set empty array.
     * We remove whatever user has in localStorage.
     * They can't add nor remove elements from allocate, they should not have anything there.
     */
    if (areCurrentEpochsProjectsHiddenOutsideAllocationWindow) {
      setAllocations([]);
      return;
    }

    const localStorageAllocationItems = JSON.parse(
      localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null',
    );

    if (!localStorageAllocationItems || localStorageAllocationItems.length === 0) {
      setAllocations([]);
      return;
    }

    const validatedProposalsInLocalStorage = getValidatedProposalsFromLocalStorage(
      localStorageAllocationItems,
      proposals,
    );
    if (validatedProposalsInLocalStorage) {
      setAllocations(validatedProposalsInLocalStorage);
    }
  }, [
    allocations,
    areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    isAllocationsInitialized,
    isConnected,
    isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    proposals,
    setAllocations,
  ]);

  useEffect(() => {
    /**
     * This hook adds userAllocations to the store.
     * This needs to be done after store is populated with values from localStorage.
     *
     * When areCurrentEpochsProjectsHiddenOutsideAllocationWindow === true we don't add
     * userAllocations to the store. AllocationView is empty, user can't add projects to it,
     * Navbar badge is not visible.
     */
    if (
      !userAllocations ||
      !isAllocationsInitialized ||
      isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow ||
      areCurrentEpochsProjectsHiddenOutsideAllocationWindow
    ) {
      return;
    }
    const userAllocationsAddresses = userAllocations.elements.map(
      ({ address: userAllocationAddress }) => userAllocationAddress,
    );
    if (
      isConnected &&
      userAllocations &&
      userAllocations.elements.length > 0 &&
      !!allocations &&
      !allocations.some(allocation => userAllocationsAddresses.includes(allocation))
    ) {
      addAllocations(userAllocationsAddresses);
    }
  }, [
    addAllocations,
    allocations,
    areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    isAllocationsInitialized,
    isConnected,
    isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    userAllocations,
  ]);

  useEffect(() => {
    if (!areOctantTipsAlwaysVisible) {
      return;
    }

    setInitialStateTips();
  }, [areOctantTipsAlwaysVisible, setInitialStateTips]);
  const isLoading =
    isLoadingCurrentEpoch ||
    (!isPreLaunch && !isAllocationsInitialized) ||
    !isOnboardingInitialized ||
    !isSettingsInitialized ||
    isFlushRequired ||
    !isTipsStoreInitialized ||
    isFetchingUserTOS ||
    isFetchingAllProposals ||
    isFetchingPatronModeStatus;

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <>
      <RootRoutes isSyncingInProgress={isSyncingInProgress} />
      {!isSyncingInProgress && !isProjectAdminMode && <ModalOnboarding />}
    </>
  );
};

export default App;
