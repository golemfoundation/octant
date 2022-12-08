import { useEffect, useState } from 'react';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';

import { onAddRemoveAllocationElementLocalStorage } from './utils';

export function useIdInAllocation(proposalId: number): [boolean, (id: number) => void] {
  const [isProposalAddedToAllocate, setIsProposalAddedToAllocate] = useState<boolean>(false);
  const localStorageAllocationItems = JSON.parse(
    localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null',
  );

  useEffect(() => {
    const isAdded = localStorageAllocationItems.includes(proposalId);
    setIsProposalAddedToAllocate(isAdded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddRemoveFromAllocate = (id: number) => {
    const newIds = onAddRemoveAllocationElementLocalStorage(localStorageAllocationItems, id);
    const isAdded = newIds.includes(proposalId);
    setIsProposalAddedToAllocate(isAdded);
  };

  return [isProposalAddedToAllocate, onAddRemoveFromAllocate];
}
