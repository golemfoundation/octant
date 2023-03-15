import React, { FC, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useMetamask } from 'use-metamask';

import 'react-toastify/dist/ReactToastify.css';

import Loader from 'components/core/Loader/Loader';
import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposals from 'hooks/queries/useProposals';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import RootRoutesContainer from 'routes/RootRoutes/RootRoutesContainer';
import localStorageService from 'services/localStorageService';

import styles from './App.module.scss';
import AppProps from './types';

import 'styles/index.scss';

const validateProposalsInLocalStorage = (localStorageAllocationItems, proposals) =>
  localStorageAllocationItems.filter(item => proposals.find(({ address }) => address === item));

const App: FC<AppProps> = ({
  allocations,
  onSetAllocations,
  onDefaultValuesFromLocalStorageSetOnboarding,
  onDefaultValuesFromLocalStorageSetSettings,
  onboarding,
  settings,
}) => {
  const queryClient = useQueryClient();
  const {
    metaState: { isConnected, account },
  } = useMetamask();
  const address = account[0];
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
  const [currentAddressLocal, setCurrentAddressLocal] = useState<null | string>(null);
  const [currentEpochLocal, setCurrentEpochLocal] = useState<number | null>(null);
  const [isDecisionWindowOpenLocal, setIsDecisionWindowOpenLocal] = useState<boolean | null>(null);

  useEffect(() => {
    localStorageService.init();
    onDefaultValuesFromLocalStorageSetOnboarding();
    onDefaultValuesFromLocalStorageSetSettings();
    // eslint-disable-next-line
  }, []);

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
    const doesCurrentEpochRequireFlush =
      !!currentEpoch && !!currentEpochLocal && currentEpoch !== currentEpochLocal;
    const doesIsDecisionWindowOpenRequireFlush =
      !!isDecisionWindowOpen &&
      !!isDecisionWindowOpenLocal &&
      isDecisionWindowOpen !== isDecisionWindowOpenLocal;
    if (
      doesAddressRequireFlush ||
      doesCurrentEpochRequireFlush ||
      doesIsDecisionWindowOpenRequireFlush
    ) {
      setIsAccountChanging(true);
    }
  }, [
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
      onSetAllocations([...allocations, ...userAllocationsAddresses]);
    }
  }, [isConnected, userAllocations, allocations, onSetAllocations]);

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
      onSetAllocations([]);
      return;
    }

    const validatedProposalsInLocalStorage = validateProposalsInLocalStorage(
      localStorageAllocationItems,
      proposals,
    );
    if (validatedProposalsInLocalStorage) {
      onSetAllocations(validatedProposalsInLocalStorage);
    }
  }, [allocations, isConnected, proposals, userAllocations, onSetAllocations]);

  const areOnboardingValuesSet = Object.values(onboarding).some(value => value !== undefined);
  const areSettingValuesSet = Object.values(settings).some(value => value !== undefined);

  const isLoading =
    allocations === null || !areOnboardingValuesSet || !areSettingValuesSet || isAccountChanging;

  if (isLoading) {
    return <Loader className={styles.loader} />;
  }

  return <RootRoutesContainer />;
};

export default App;
