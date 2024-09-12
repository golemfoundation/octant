import { useQueryClient } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect } from 'wagmi';

import networkConfig from 'constants/networkConfig';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useSyncStatus, { Response } from 'hooks/queries/useSyncStatus';
import localStorageService, { LocalStorageInitParams } from 'services/localStorageService';
import toastService from 'services/toastService';
import useAllocationsStore from 'store/allocations/store';
import useDelegationStore from 'store/delegation/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import useTransactionLocalStore from 'store/transactionLocal/store';

import useAvailableFundsEth from './useAvailableFundsEth';
import useAvailableFundsGlm from './useAvailableFundsGlm';
import useEpochAndAllocationTimestamps from './useEpochAndAllocationTimestamps';

export default function useAppConnectManager(
  isFlushRequired: boolean,
  setIsFlushRequired: (isFlushRequiredNew: boolean) => void,
): {
  isLocalStorageInitialized: boolean;
  isSyncingInProgress: boolean;
} {
  const { t } = useTranslation('translation', { keyPrefix: 'toasts.wrongNetwork' });
  const [isLocalStorageInitialized, setIsLocalStorageInitialized] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { address, isConnected, chainId } = useAccount();
  const { reset } = useConnect();

  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: projectsEpoch } = useProjectsEpoch();

  const [isConnectedLocal, setIsConnectedLocal] = useState<boolean>(false);
  const [currentAddressLocal, setCurrentAddressLocal] = useState<string | null>(null);
  const [syncStatusLocal, setSyncStatusLocal] = useState<Response | null>(null);

  const [isTimeDifferenceBelowZero, setIsTimeDifferenceBelowZero] = useState(false);
  const isSyncingInProgress =
    syncStatusLocal?.pendingSnapshot === 'in_progress' || isTimeDifferenceBelowZero;

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
  const { setValuesFromLocalStorage: setValuesFromLocalStorageDelegation, isDelegationInProgress } =
    useDelegationStore(state => ({
      isDelegationInProgress: state.data.isDelegationInProgress,
      setValuesFromLocalStorage: state.setValuesFromLocalStorage,
    }));
  const { setValuesFromLocalStorage: setValuesFromLocalStorageOnboarding } = useOnboardingStore(
    state => ({
      setValuesFromLocalStorage: state.setValuesFromLocalStorage,
    }),
  );
  const { reset: resetTransactionLocalStore } = useTransactionLocalStore(state => ({
    reset: state.reset,
  }));

  const initializeStore = (
    localStorageInitParams: Partial<LocalStorageInitParams>,
    shouldDoReset = false,
  ) => {
    if (
      localStorageInitParams.isDecisionWindowOpen === undefined ||
      localStorageInitParams.currentEpoch === undefined ||
      localStorageInitParams.projectsEpoch === undefined
    ) {
      setIsLocalStorageInitialized(false);
      return;
    }

    // Store is populated with data from LS, hence init here.
    localStorageService.init(localStorageInitParams as LocalStorageInitParams);
    setValuesFromLocalStorageSettings();
    setValuesFromLocalStorageDelegation();
    setValuesFromLocalStorageOnboarding();
    setValuesFromLocalStorageTips();

    // On init load reset is not required, when changing account -- yes.
    if (shouldDoReset) {
      resetAllocationsStore();
      resetTransactionLocalStore();
    }

    setIsLocalStorageInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    if (!chainId) {
      if (toastService.isToastVisible('changeNetwork')) {
        toastService.hideToast('changeNetwork');
      }
      return;
    }
    if (!toastService.isToastVisible('changeNetwork') && chainId !== networkConfig.id) {
      toastService.showToast({
        message: t('message', {
          isTestnet: networkConfig.isTestnet ? ' testnet' : '',
          networkName: networkConfig.name,
        }),
        name: 'changeNetwork',
        title: t('title'),
        type: 'error',
      });
      return;
    }
    if (toastService.isToastVisible('changeNetwork')) {
      toastService.hideToast('changeNetwork');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  useEffect(() => {
    if (isSyncingInProgress) {
      setIsLocalStorageInitialized(false);
    }
  }, [isSyncingInProgress]);

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
    initializeStore({
      currentEpoch,
      isDecisionWindowOpen,
      projectsEpoch,
    });
    // eslint-disable-next-line
  }, [isDecisionWindowOpen, currentEpoch, projectsEpoch]);

  useEffect(() => {
    if (syncStatus && !isEqual(syncStatus, syncStatusLocal)) {
      setSyncStatusLocal(syncStatus);
    }
  }, [syncStatus, syncStatusLocal, setSyncStatusLocal]);

  useEffect(() => {
    if (isConnected !== isConnectedLocal) {
      setIsConnectedLocal(isConnected);
    }
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
    if (
      (doesAddressRequireFlush || doesIsConnectedRequireFlush || doesSyncStatusRequireFlush) &&
      !isDelegationInProgress
    ) {
      setIsFlushRequired(true);
    }
    if (doesIsConnectedRequireFlush) {
      initializeStore({ currentEpoch, isDecisionWindowOpen, projectsEpoch }, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnected,
    isConnectedLocal,
    address,
    currentAddressLocal,
    queryClient,
    syncStatus,
    syncStatusLocal,
    setIsFlushRequired,
    isDecisionWindowOpen,
    currentEpoch,
    projectsEpoch,
  ]);

  useEffect(() => {
    if (isFlushRequired) {
      queryClient.clear();
      queryClient.refetchQueries().then(() => {
        setIsFlushRequired(false);
      });
    }
  }, [isFlushRequired, setIsFlushRequired, queryClient]);

  useEffect(() => {
    if (isDecisionWindowOpen === undefined || !timeCurrentAllocationEnd || !timeCurrentEpochEnd) {
      return;
    }
    const timestamp = isDecisionWindowOpen ? timeCurrentAllocationEnd : timeCurrentEpochEnd;

    const timeToChangeAllocationWindowStatusIntervalId = setInterval(() => {
      const timeDifference = Math.ceil(timestamp - Date.now());
      if (timeDifference <= 0) {
        setIsTimeDifferenceBelowZero(true);
        setIsFlushRequired(true);
      } else {
        setIsTimeDifferenceBelowZero(false);
      }
    }, 1000);

    return () => {
      clearInterval(timeToChangeAllocationWindowStatusIntervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd]);

  return { isLocalStorageInitialized, isSyncingInProgress };
}
