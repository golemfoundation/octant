import { useQueryClient } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';
import React, { ReactElement, useState, Fragment, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect, useNetwork } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';

import AppLoader from 'components/dedicated/AppLoader/AppLoader';
import ModalOnboarding from 'components/dedicated/ModalOnboarding/ModalOnboarding';
// import useAppConnectManager from 'hooks/helpers/useAppConnectManager';
import useAppIsLoading from 'hooks/helpers/useAppIsLoading';
import useAppPopulateState from 'hooks/helpers/useAppPopulateState';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useManageTransactionsPending from 'hooks/helpers/useManageTransactionsPending';
import RootRoutes from 'routes/RootRoutes/RootRoutes';

import networkConfig from '../constants/networkConfig';
import useAvailableFundsEth from '../hooks/helpers/useAvailableFundsEth';
import useAvailableFundsGlm from '../hooks/helpers/useAvailableFundsGlm';
import useEpochAndAllocationTimestamps from '../hooks/helpers/useEpochAndAllocationTimestamps';
import useCurrentEpoch from '../hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from '../hooks/queries/useIsDecisionWindowOpen';
import useSyncStatus, { Response } from '../hooks/queries/useSyncStatus';
import localStorageService from '../services/localStorageService';
import useAllocationsStore from '../store/allocations/store';
import useOnboardingStore from '../store/onboarding/store';
import useSettingsStore from '../store/settings/store';
import useTipsStore from '../store/tips/store';
import useTransactionLocalStore from '../store/transactionLocal/store';
import triggerToast from '../utils/triggerToast';

import 'styles/index.scss';
import 'i18n';

const App = (): ReactElement => {
  useManageTransactionsPending();
  useAppPopulateState();
  const [isFlushRequired, setIsFlushRequired] = useState(false);

  // ---

  const { t } = useTranslation('translation', { keyPrefix: 'toasts.wrongNetwork' });
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { reset } = useConnect();

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: currentEpoch } = useCurrentEpoch();

  const [isConnectedLocal, setIsConnectedLocal] = useState<boolean>(false);
  const [currentAddressLocal, setCurrentAddressLocal] = useState<string | null>(null);
  const [syncStatusLocal, setSyncStatusLocal] = useState<Response | null>(null);
  const [currentEpochLocal, setCurrentEpochLocal] = useState<number | null>(null);
  const [isDecisionWindowOpenLocal, setIsDecisionWindowOpenLocal] = useState<boolean | null>(null);

  const isSyncingInProgress = syncStatusLocal?.pendingSnapshot === 'in_progress';

  const { refetch: refetchAvailableFundsEth } = useAvailableFundsEth();
  const { refetch: refetchAvailableFundsGlm } = useAvailableFundsGlm();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();
  const { data: syncStatus } = useSyncStatus({
    refetchInterval: isSyncingInProgress ? 5000 : false,
  });

  const { reset: resetAllocationsStore } = useAllocationsStore(state => ({
    reset: state.reset,
  }));
  const { setValuesFromLocalStorage: setValuesFromLocalStorageTips } = useTipsStore(state => ({
    setValuesFromLocalStorage: state.setValuesFromLocalStorage,
  }));
  const { setValuesFromLocalStorage: setValuesFromLocalStorageSettings } = useSettingsStore(
    state => ({
      setValuesFromLocalStorage: state.setValuesFromLocalStorage,
    }),
  );
  const { setValuesFromLocalStorage: setValuesFromLocalStorageOnboarding } = useOnboardingStore(
    state => ({
      setValuesFromLocalStorage: state.setValuesFromLocalStorage,
    }),
  );
  const { reset: resetTransactionLocalStore } = useTransactionLocalStore(state => ({
    reset: state.reset,
  }));

  const initializeStore = useCallback((shouldDoReset = false) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const doesIsConnectedRequireFlush = !isConnected && isConnectedLocal;
    const doesSyncStatusRequireFlush =
      !!syncStatus && !!syncStatusLocal && !isEqual(syncStatus, syncStatusLocal);
    const doesCurrentEpochRequireFlush =
      !!currentEpoch && !!currentEpochLocal && currentEpoch !== currentEpochLocal;
    const doesIsDecisionWindowOpenRequireFlush =
      !!isDecisionWindowOpen &&
      !!isDecisionWindowOpenLocal &&
      isDecisionWindowOpen !== isDecisionWindowOpenLocal;
    if (
      doesCurrentEpochRequireFlush ||
      doesIsDecisionWindowOpenRequireFlush ||
      doesAddressRequireFlush ||
      doesIsConnectedRequireFlush ||
      doesSyncStatusRequireFlush
    ) {
      setIsFlushRequired(true);
    }
    if (doesIsConnectedRequireFlush) {
      initializeStore(true);
    }
  }, [
    currentEpoch,
    currentEpochLocal,
    isDecisionWindowOpen,
    isDecisionWindowOpenLocal,
    isConnected,
    isConnectedLocal,
    address,
    currentAddressLocal,
    initializeStore,
    queryClient,
    syncStatus,
    syncStatusLocal,
    setIsFlushRequired,
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
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd, setIsFlushRequired]);

  // ---

  // const { isSyncingInProgress } = useAppConnectManager(isFlushRequired, setIsFlushRequired);
  const isLoading = useAppIsLoading(isFlushRequired);
  const isProjectAdminMode = useIsProjectAdminMode();

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
