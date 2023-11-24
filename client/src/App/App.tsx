import { useQueryClient } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';
import React, { ReactElement, useEffect, useState } from 'react';
import { useAccount, useConnect, useNetwork } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';

import AppLoader from 'components/dedicated/AppLoader/AppLoader';
import ModalOnboarding from 'components/dedicated/ModalOnboarding/ModalOnboarding';
import networkConfig from 'constants/networkConfig';
import useAppIsLoading from 'hooks/helpers/useAppIsLoading';
import useAppPopulateState from 'hooks/helpers/useAppPopulateState';
import useAvailableFundsEth from 'hooks/helpers/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useManageTransactionsPending from 'hooks/helpers/useManageTransactionsPending';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useSyncStatus, { Response } from 'hooks/queries/useSyncStatus';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import localStorageService from 'services/localStorageService';
import useAllocationsStore from 'store/allocations/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import useTransactionLocalStore from 'store/transactionLocal/store';
import triggerToast from 'utils/triggerToast';

import 'styles/index.scss';
import 'i18n';

const App = (): ReactElement => {
  useManageTransactionsPending();
  useAppPopulateState();
  const { chain } = useNetwork();
  const { reset: resetAllocationsStore } = useAllocationsStore(state => ({
    reset: state.reset,
  }));
  const { setValuesFromLocalStorage: setValuesFromLocalStorageTips } = useTipsStore(
    ({ setValuesFromLocalStorage }) => ({
      setValuesFromLocalStorage,
    }),
  );
  const { setValuesFromLocalStorageSettings } = useSettingsStore(state => ({
    setValuesFromLocalStorageSettings: state.setValuesFromLocalStorage,
  }));
  const { setValuesFromLocalStorage: setValuesFromLocalStorageOnboarding } = useOnboardingStore(
    state => ({
      isInitialized: state.meta.isInitialized,
      setValuesFromLocalStorage: state.setValuesFromLocalStorage,
    }),
  );
  const { reset: resetTransactionLocalStore } = useTransactionLocalStore(state => ({
    reset: state.reset,
  }));
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const [isFlushRequired, setIsFlushRequired] = useState(false);
  const isProjectAdminMode = useIsProjectAdminMode();
  const [isConnectedLocal, setIsConnectedLocal] = useState<boolean>(false);
  const [currentAddressLocal, setCurrentAddressLocal] = useState<string | null>(null);
  const [currentEpochLocal, setCurrentEpochLocal] = useState<number | null>(null);
  const [isDecisionWindowOpenLocal, setIsDecisionWindowOpenLocal] = useState<boolean | null>(null);
  const [syncStatusLocal, setSyncStatusLocal] = useState<Response | null>(null);
  const [chainIdLocal, setChainIdLocal] = useState<number | null>(null);
  const isSyncingInProgress = syncStatusLocal?.pendingSnapshot === 'in_progress';
  const { data: syncStatus } = useSyncStatus({
    refetchInterval: isSyncingInProgress ? 5000 : false,
  });
  const { reset } = useConnect();
  const { refetch: refetchAvailableFundsEth } = useAvailableFundsEth();
  const { refetch: refetchAvailableFundsGlm } = useAvailableFundsGlm();

  const isLoading = useAppIsLoading(isFlushRequired);

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
