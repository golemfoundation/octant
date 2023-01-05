import { useMetamask } from 'use-metamask';
import React, { FC, useEffect } from 'react';

import 'react-toastify/dist/ReactToastify.css';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import Loader from 'components/core/loader/loader.component';
import RootRoutes from 'routes/root-routes/root.routes';
import useProposals from 'hooks/useProposals';
import useUserVote from 'hooks/useUserVote';

import AppProps from './types';
import styles from './style.module.scss';

import 'styles/index.scss';

const validateProposalsInLocalStorage = (localStorageAllocationItems, proposals) =>
  localStorageAllocationItems.filter(item => proposals.find(({ id }) => id.toNumber() === item));

const App: FC<AppProps> = ({ allocations, onAddAllocation, onAddAllocations }) => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const { proposals } = useProposals();
  const { data: userVote } = useUserVote();

  useEffect(() => {
    if (
      isConnected &&
      userVote &&
      userVote.proposalId &&
      userVote.alpha > 0 &&
      !!allocations &&
      !allocations.includes(userVote.proposalId)
    ) {
      onAddAllocation(userVote.proposalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userVote, allocations]);

  useEffect(() => {
    if (!proposals || proposals.length === 0) {
      return;
    }

    if (isConnected && !userVote) {
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
  }, [isConnected, proposals, userVote]);

  if (allocations === null) {
    return <Loader className={styles.loader} />;
  }

  return <RootRoutes />;
};

export default App;
