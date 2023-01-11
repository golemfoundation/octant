import { useMetamask } from 'use-metamask';
import { useQueryClient } from 'react-query';
import React, { FC, useEffect, useState } from 'react';

import 'react-toastify/dist/ReactToastify.css';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import Loader from 'components/core/Loader/Loader';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import useProposals from 'hooks/useProposals';
import useUserAllocation from 'hooks/useUserAllocation';

import AppProps from './types';
import styles from './style.module.scss';

import 'styles/index.scss';

const validateProposalsInLocalStorage = (localStorageAllocationItems, proposals) =>
  localStorageAllocationItems.filter(item => proposals.find(({ id }) => id.toNumber() === item));

const App: FC<AppProps> = ({ allocations, onAddAllocation, onAddAllocations }) => {
  const {
    metaState: { isConnected, account },
  } = useMetamask();
  const address = account[0];
  const [isAccountChanging, setIsAccountChanging] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<null | string>(null);
  const { proposals } = useProposals();
  const { data: userAllocation } = useUserAllocation();
  const queryClient = useQueryClient();

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
    if (
      isConnected &&
      userAllocation &&
      userAllocation.proposalId &&
      userAllocation.allocation.gt(0) &&
      !!allocations &&
      !allocations.includes(userAllocation.proposalId)
    ) {
      onAddAllocation(userAllocation.proposalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userAllocation, allocations]);

  useEffect(() => {
    if (!proposals || proposals.length === 0) {
      return;
    }

    if (isConnected && !userAllocation) {
      return;
    }

    const localStorageAllocationItems = JSON.parse(
      localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null',
    );

    if (!localStorageAllocationItems || localStorageAllocationItems.length === 0) {
      onAddAllocations([]);
      return;
    }

    const validatedProposalsInLocalStorage = validateProposalsInLocalStorage(
      localStorageAllocationItems,
      proposals,
    );
    if (validatedProposalsInLocalStorage) {
      localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(validatedProposalsInLocalStorage));
      onAddAllocations(validatedProposalsInLocalStorage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, proposals, userAllocation]);

  if (allocations === null || isAccountChanging) {
    return <Loader className={styles.loader} />;
  }

  return <RootRoutes />;
};

export default App;
