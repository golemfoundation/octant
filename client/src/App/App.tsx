import { useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import React, { ReactElement, useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';

import AppLoader from 'components/dedicated/AppLoader/AppLoader';
import ModalOnboarding from 'components/dedicated/ModalOnboarding/ModalOnboarding';
import { ALLOCATION_ITEMS_KEY, ALLOCATION_REWARDS_FOR_PROPOSALS } from 'constants/localStorageKeys';
import networkConfig from 'constants/networkConfig';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import localStorageService from 'services/localStorageService';
import useAllocationsStore from 'store/allocations/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';
import triggerToast from 'utils/triggerToast';

import { getValidatedProposalsFromLocalStorage } from './utils';
import 'styles/index.scss';
import 'i18n';

const App = (): ReactElement => {
  const { chain } = useNetwork();
  const {
    allocations,
    setAllocations,
    addAllocations,
    isAllocationsInitialized,
    setRewardsForProposals,
  } = useAllocationsStore(state => ({
    addAllocations: state.addAllocations,
    allocations: state.data.allocations,
    isAllocationsInitialized: state.meta.isInitialized,
    setAllocations: state.setAllocations,
    setRewardsForProposals: state.setRewardsForProposals,
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
  const { data: currentEpoch, isLoading: isLoadingCurrentEpoch } = useCurrentEpoch({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: proposals } = useProposalsContract();
  const { data: userAllocations } = useUserAllocations();
  const { data: individualReward } = useIndividualReward();
  const [isAccountChanging, setIsAccountChanging] = useState(false);
  const [isConnectedLocal, setIsConnectedLocal] = useState<boolean>(false);
  const [currentAddressLocal, setCurrentAddressLocal] = useState<null | string>(null);
  const [currentEpochLocal, setCurrentEpochLocal] = useState<number | null>(null);
  const [isDecisionWindowOpenLocal, setIsDecisionWindowOpenLocal] = useState<boolean | null>(null);
  const [chainIdLocal, setChainIdLocal] = useState<number | null>(null);
  const isPreLaunch = getIsPreLaunch(currentEpoch);

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

    const validatedProposalsInLocalStorage = getValidatedProposalsFromLocalStorage(
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
  }, [isAllocationsInitialized, isConnected, userAllocations, allocations, addAllocations]);

  useEffect(() => {
    /**
     * This hook adds rewardsForProposals to the store.
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
      return;
    }
    setRewardsForProposals(
      localStorageRewardsForProposals.gt(individualReward)
        ? BigNumber.from(0)
        : localStorageRewardsForProposals,
    );
    // .toHexString(), because React can't compare objects as deps in hooks, causing infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [individualReward?.toHexString(), userAllocations?.elements.length]);

  useEffect(() => {
    if (!areOctantTipsAlwaysVisible) {
      return;
    }
    resetTipsStore();
  }, [areOctantTipsAlwaysVisible, resetTipsStore]);

  const isLoading =
    isLoadingCurrentEpoch ||
    (!isPreLaunch && !isAllocationsInitialized) ||
    !isOnboardingInitialized ||
    !isSettingsInitialized ||
    isAccountChanging ||
    !isTipsStoreInitialized;

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <>
      <RootRoutes />
      <ModalOnboarding />
    </>
  );
};

export default App;
