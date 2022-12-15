import { useEffect, useState } from 'react';
import { useMetamask } from 'use-metamask';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import { ExtendedProposal } from 'types/proposals';

import { onAddRemoveAllocationElementLocalStorage } from '../utils';
import useUserVote from '../useUserVote';

const validateProposalsInLocalStorage = (localStorageAllocationItems, proposals) =>
  localStorageAllocationItems.filter(item => proposals.find(({ id }) => id.toNumber() === item));

export default function useIdsInAllocation(
  proposals: ExtendedProposal[],
): [undefined | number[], (id: number) => void] {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const [idsInAllocation, setIdsInAllocation] = useState<undefined | number[]>(undefined);
  const { data: userVote } = useUserVote();

  const onAddRemoveFromAllocate = (id: number) => {
    const newIds = onAddRemoveAllocationElementLocalStorage(idsInAllocation!, id);
    setIdsInAllocation(newIds);
  };

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

    if (
      isConnected &&
      userVote &&
      userVote.proposalId &&
      !localStorageAllocationItems.includes(userVote.proposalId)
    ) {
      onAddRemoveFromAllocate(userVote.proposalId);
    }

    if (!localStorageAllocationItems || localStorageAllocationItems.length === 0) {
      return;
    }

    const validatedProposalsInLocalStorage = validateProposalsInLocalStorage(
      localStorageAllocationItems,
      proposals,
    );
    if (validatedProposalsInLocalStorage) {
      localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(validatedProposalsInLocalStorage));
      setIdsInAllocation(validatedProposalsInLocalStorage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, proposals, userVote]);

  return [idsInAllocation, onAddRemoveFromAllocate];
}
