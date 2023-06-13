import { useQueryClient } from '@tanstack/react-query';
import React, { ReactElement, useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';

import AppLoader from 'components/dedicated/AppLoader/AppLoader';
import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import networkConfig from 'constants/networkConfig';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import localStorageService from 'services/localStorageService';
import useAllocationsStore from 'store/allocations/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import triggerToast from 'utils/triggerToast';

import 'styles/index.scss';
import 'i18n';

const validateProposalsInLocalStorage = (
  localStorageAllocationItems: string[],
  proposals: string[],
): string[] =>
  localStorageAllocationItems.filter(item => proposals.find(address => address === item));

const App = (): ReactElement => {
  const { chain } = useNetwork();
  const { allocations, setAllocations, addAllocations, isAllocationsInitialized } =
    useAllocationsStore(state => ({
      addAllocations: state.addAllocations,
      allocations: state.data.allocations,
      isAllocationsInitialized: state.meta.isInitialized,
      setAllocations: state.setAllocations,
    }));
  const {
    setValuesFromLocalStorage: setValuesFromLocalStorageTips,
    isInitialized: isTipsStoreInitialized,
    reset: resetTipsStore,
  } = useTipsStore(({ meta, setValuesFromLocalStorage, reset }) => ({
    isInitialized: meta.isInitialized,
    reset,
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
  } = useOnboardingStore(({ meta, setValuesFromLocalStorage }) => ({
    isInitialized: meta.isInitialized,
    setValuesFromLocalStorage,
  }));
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  useCryptoValues(displayCurrency, {
    onError: () => {
      setIsCryptoMainValueDisplay(true);
    },
  });
  const { data: currentEpoch } = useCurrentEpoch({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: proposals } = useProposalsContract();
  const { data: userAllocations } = useUserAllocations();
  const [isAccountChanging, setIsAccountChanging] = useState(false);
  const [isConnectedLocal, setIsConnectedLocal] = useState<boolean>(false);
  const [currentAddressLocal, setCurrentAddressLocal] = useState<null | string>(null);
  const [currentEpochLocal, setCurrentEpochLocal] = useState<number | null>(null);
  const [isDecisionWindowOpenLocal, setIsDecisionWindowOpenLocal] = useState<boolean | null>(null);
  const [chainIdLocal, setChainIdLocal] = useState<number | null>(null);

  useEffect(() => {
    if (chainIdLocal && chainIdLocal !== networkConfig.id) {
      triggerToast({
        message: `Please change network to ${networkConfig.name} testnet`,
        title: 'Wrong network',
        type: 'error',
      });
    }
  }, [chainIdLocal]);

  useEffect(() => {
    if (chain && chain.id && chain.id !== chainIdLocal) {
      setChainIdLocal(chain.id);
    }
  }, [chain, chainIdLocal, setChainIdLocal]);

  useEffect(() => {
    localStorageService.init();
    setValuesFromLocalStorageSettings();
    setValuesFromLocalStorageOnboarding();
    setValuesFromLocalStorageTips();
    // eslint-disable-next-line
  }, []);

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
    const doesChainIdRequireFlush = chain && chain.id && chain.id !== chainIdLocal;
    const doesIsConnectedRequireFlush = !isConnected && isConnectedLocal;
    const doesAddressRequireFlush =
      !!address && !!currentAddressLocal && address !== currentAddressLocal;
    const doesCurrentEpochRequireFlush =
      !!currentEpoch && !!currentEpochLocal && currentEpoch !== currentEpochLocal;
    const doesIsDecisionWindowOpenRequireFlush =
      !!isDecisionWindowOpen &&
      !!isDecisionWindowOpenLocal &&
      isDecisionWindowOpen !== isDecisionWindowOpenLocal;
    if (
      doesChainIdRequireFlush ||
      doesIsConnectedRequireFlush ||
      doesAddressRequireFlush ||
      doesCurrentEpochRequireFlush ||
      doesIsDecisionWindowOpenRequireFlush
    ) {
      setIsAccountChanging(true);
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
  ]);

  useEffect(() => {
    (() => {
      if (isAccountChanging) {
        queryClient.clear();
        queryClient.refetchQueries().then(() => {
          setIsAccountChanging(false);
        });
      }
    })();
  }, [isAccountChanging, setIsAccountChanging, queryClient]);

  useEffect(() => {
    /**
     * This hook validates allocations in localStorage
     * and populates store with them or sets empty array.
     */
    if (!proposals || proposals.length === 0 || isAllocationsInitialized) {
      return;
    }

    const localStorageAllocationItems = JSON.parse(
      localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null',
    );

    if (!localStorageAllocationItems || localStorageAllocationItems.length === 0) {
      setAllocations([]);
      return;
    }

    const validatedProposalsInLocalStorage = validateProposalsInLocalStorage(
      localStorageAllocationItems,
      proposals,
    );
    if (validatedProposalsInLocalStorage) {
      setAllocations(validatedProposalsInLocalStorage);
    }
  }, [isAllocationsInitialized, allocations, isConnected, proposals, setAllocations]);

  useEffect(() => {
    /**
     * This hook adds userAllocations to the store.
     * This needs to be done after store is populated with values from localStorage.
     */
    if (!userAllocations || isAllocationsInitialized) {
      return;
    }
    const userAllocationsAddresses = userAllocations.map(({ proposalAddress }) => proposalAddress);
    if (
      isConnected &&
      userAllocations &&
      userAllocations.length > 0 &&
      !!allocations &&
      !allocations.some(allocation => userAllocationsAddresses.includes(allocation))
    ) {
      addAllocations(userAllocationsAddresses);
    }
  }, [isAllocationsInitialized, isConnected, userAllocations, allocations, addAllocations]);

  useEffect(() => {
    if (!areOctantTipsAlwaysVisible) {
      return;
    }
    resetTipsStore();
  }, [areOctantTipsAlwaysVisible, resetTipsStore]);

  const isLoading =
    !isAllocationsInitialized ||
    !isOnboardingInitialized ||
    !isSettingsInitialized ||
    isAccountChanging ||
    !isTipsStoreInitialized;

  if (isLoading) {
    return <AppLoader />;
  }

  return <RootRoutes />;
};

export default App;
