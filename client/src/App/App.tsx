import React, { FC, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useMetamask } from 'use-metamask';

import 'react-toastify/dist/ReactToastify.css';

import Loader from 'components/core/Loader/Loader';
import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import useProposals from 'hooks/queries/useProposals';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import RootRoutesContainer from 'routes/RootRoutes/RootRoutesContainer';
import localStorageService from 'services/localStorageService';

import styles from './style.module.scss';
import AppProps from './types';

import 'styles/index.scss';

const validateProposalsInLocalStorage = (localStorageAllocationItems, proposals) =>
  localStorageAllocationItems.filter(item => proposals.find(({ id }) => id.toNumber() === item));

const App: FC<AppProps> = ({
  allocations,
  onSetAllocations,
  onDefaultValuesFromLocalStorageSetOnboarding,
  onDefaultValuesFromLocalStorageSetSettings,
  onboarding,
  settings,
}) => {
  const {
    metaState: { isConnected, account },
  } = useMetamask();
  const address = account[0];
  const [isAccountChanging, setIsAccountChanging] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<null | string>(null);
  const { proposals } = useProposals();
  const { data: userAllocations } = useUserAllocations();
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorageService.init();
    onDefaultValuesFromLocalStorageSetOnboarding();
    onDefaultValuesFromLocalStorageSetSettings();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (address && address !== currentAddress) {
      setCurrentAddress(address);
    }
  }, [address, currentAddress, setCurrentAddress]);

  useEffect(() => {
    if (address && currentAddress && address !== currentAddress) {
      setIsAccountChanging(true);
    }
  }, [address, currentAddress, queryClient]);

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
    const userAllocationsIds = userAllocations.map(({ proposalId }) => proposalId);
    if (
      isConnected &&
      userAllocations &&
      userAllocations.length > 0 &&
      !!allocations &&
      !allocations.some(allocation => userAllocationsIds.includes(allocation))
    ) {
      onSetAllocations([...allocations, ...userAllocationsIds]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userAllocations, allocations]);

  useEffect(() => {
    if (!proposals || proposals.length === 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, proposals, userAllocations]);

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
