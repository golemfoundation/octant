import React, { ReactElement, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useAccount } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';

import Loader from 'components/core/Loader/Loader';
import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposals from 'hooks/queries/useProposals';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import localStorageService from 'services/localStorageService';
import useAllocationsStore from 'store/allocations/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';

import styles from './App.module.scss';

import 'styles/index.scss';

const validateProposalsInLocalStorage = (localStorageAllocationItems, proposals) =>
  localStorageAllocationItems.filter(item => proposals.find(({ address }) => address === item));

const App = (): ReactElement => {
  const { data: allocations, setAllocations } = useAllocationsStore();
  const {
    data: settings,
    setValuesFromLocalStorage: setValuesFromLocalStorageSettings,
    setIsCryptoMainValueDisplay,
  } = useSettingsStore();
  const { data: onboarding, setValuesFromLocalStorage: setValuesFromLocalStorageOnboarding } =
    useOnboardingStore();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  useCryptoValues(settings.displayCurrency, {
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
  const { data: proposals } = useProposals();
  const { data: userAllocations } = useUserAllocations();
  const [isAccountChanging, setIsAccountChanging] = useState(false);
  const [isConnectedLocal, setIsConnectedLocal] = useState<boolean>(false);
  const [currentAddressLocal, setCurrentAddressLocal] = useState<null | string>(null);
  const [currentEpochLocal, setCurrentEpochLocal] = useState<number | null>(null);
  const [isDecisionWindowOpenLocal, setIsDecisionWindowOpenLocal] = useState<boolean | null>(null);

  useEffect(() => {
    localStorageService.init();
    setValuesFromLocalStorageSettings();
    setValuesFromLocalStorageOnboarding();
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
    if (!userAllocations) {
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
      setAllocations([...allocations, ...userAllocationsAddresses]);
    }
  }, [isConnected, userAllocations, allocations, setAllocations]);

  useEffect(() => {
    if (!proposals || proposals.length === 0 || allocations !== null) {
      return;
    }

    if (isConnected && !userAllocations) {
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
  }, [allocations, isConnected, proposals, userAllocations, setAllocations]);

  const areOnboardingValuesSet = Object.values(onboarding).some(value => value !== undefined);
  const areSettingValuesSet = Object.values(settings).some(value => value !== undefined);

  const isLoading =
    allocations === null || !areOnboardingValuesSet || !areSettingValuesSet || isAccountChanging;

  if (isLoading) {
    return <Loader className={styles.loader} />;
  }

  return <RootRoutes />;
};

export default App;
