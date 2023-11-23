import { useQueryClient } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';
import React, { ReactElement, useEffect, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect, useNetwork } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';

import AppLoader from 'components/dedicated/AppLoader/AppLoader';
import ModalOnboarding from 'components/dedicated/ModalOnboarding/ModalOnboarding';
import networkConfig from 'constants/networkConfig';
import useAppPopulateState from 'hooks/helpers/useAppPopulateState';
import useAvailableFundsEth from 'hooks/helpers/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useManageTransactionsPending from 'hooks/helpers/useManageTransactionsPending';
import useAllProposals from 'hooks/queries/useAllProposals';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useSyncStatus, { Response } from 'hooks/queries/useSyncStatus';
import useUserTOS from 'hooks/queries/useUserTOS';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import localStorageService from 'services/localStorageService';
import useAllocationsStore from 'store/allocations/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';
import triggerToast from 'utils/triggerToast';

import 'styles/index.scss';
import 'i18n';

const App = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'toasts.wrongNetwork' });
  useManageTransactionsPending();
  useAppPopulateState();
  const { chain } = useNetwork();
  const { reset } = useConnect();
  const { isAllocationsInitialized, reset: resetAllocationsStore } = useAllocationsStore(state => ({
    isAllocationsInitialized: state.meta.isInitialized,
    reset: state.reset,
  }));
  const {
    setValuesFromLocalStorage: setValuesFromLocalStorageTips,
    isInitialized: isTipsStoreInitialized,
  } = useTipsStore(state => ({
    isInitialized: state.meta.isInitialized,
    setValuesFromLocalStorage: state.setValuesFromLocalStorage,
  }));
  const { isSettingsInitialized, setValuesFromLocalStorageSettings } = useSettingsStore(state => ({
    isSettingsInitialized: state.meta.isInitialized,
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
  const { data: currentEpoch, isLoading: isLoadingCurrentEpoch } = useCurrentEpoch({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { isFetching: isFetchingAllProposals } = useAllProposals();
  const { isFetching: isFetchingPatronModeStatus } = useIsPatronMode();
  const [isFlushRequired, setIsFlushRequired] = useState(false);
  const isProjectAdminMode = useIsProjectAdminMode();
  const [isConnectedLocal, setIsConnectedLocal] = useState<boolean>(false);
  const [currentAddressLocal, setCurrentAddressLocal] = useState<string | null>(null);
  const [syncStatusLocal, setSyncStatusLocal] = useState<Response | null>(null);
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const { isFetching: isFetchingUserTOS } = useUserTOS();
  const isSyncingInProgress = syncStatusLocal?.pendingSnapshot === 'in_progress';
  const { data: syncStatus } = useSyncStatus({
    refetchInterval: isSyncingInProgress ? 5000 : false,
  });
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();
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

  // Listener to reload app after allocation window status changes (instead of refetching a lot of stuff without reloading)
  useEffect(() => {
    if (isDecisionWindowOpen === undefined || !timeCurrentAllocationEnd || !timeCurrentEpochEnd) {
      return;
    }
    const timestamp = isDecisionWindowOpen ? timeCurrentAllocationEnd : timeCurrentEpochEnd;

    const timeToChangeAllocationWindowStatusIntervalId = setInterval(() => {
      const timeDifference = Math.ceil(timestamp - Date.now());
      if (timeDifference <= 0) {
        clearInterval(timeToChangeAllocationWindowStatusIntervalId);
        setIsFlushRequired(true);
      }
    }, 1000);

    return () => clearInterval(timeToChangeAllocationWindowStatusIntervalId);
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd]);

  useEffect(() => {
    if (chain && chain.id !== networkConfig.id) {
      triggerToast({
        message: t('message', {
          isTestnet: networkConfig.isTestnet ? ' testnet' : '',
          networkName: networkConfig.name,
        }),
        title: t('title'),
        type: 'error',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain?.id]);

  useEffect(() => {
    /**
     * Possible solution for invalid cached `isConnect` value.
     * This snippet resets data from `useConnect` hook and try ty refetch wallet balance (eth + glm)
     * when wallet is disconnected and app still has old data in cache (query cache update).
     */
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
    const doesAddressRequireFlush =
      !!address && !!currentAddressLocal && address !== currentAddressLocal;
    const doesIsConnectedRequireFlush = !isConnected && isConnectedLocal;
    const doesSyncStatusRequireFlush =
      !!syncStatus && !!syncStatusLocal && !isEqual(syncStatus, syncStatusLocal);
    if (doesAddressRequireFlush || doesIsConnectedRequireFlush || doesSyncStatusRequireFlush) {
      setIsFlushRequired(true);
    }
  }, [
    isConnected,
    isConnectedLocal,
    address,
    currentAddressLocal,
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
    <Fragment>
      <RootRoutes isSyncingInProgress={isSyncingInProgress} />
      {!isSyncingInProgress && !isProjectAdminMode && <ModalOnboarding />}
    </Fragment>
  );
};

export default App;
