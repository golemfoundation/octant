import { useEffect, useState } from 'react';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import { ExtendedProposal } from 'types/proposals';

const validateProposalsInLocalStorage = (localStorageAllocationItems, proposals) =>
  localStorageAllocationItems.filter(item => proposals.find(({ id }) => id === item));

export function useIdsInAllocation(
  proposals: ExtendedProposal[],
): [number[], (id: number) => void] {
  const [idsInAllocation, setIdsInAllocation] = useState<number[]>([]);

  useEffect(() => {
    if (!proposals || proposals.length === 0) {
      return;
    }

    const localStorageAllocationItems = JSON.parse(
      localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null',
    );

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
  }, [proposals]);

  const onAddRemoveFromAllocate = (id: number) => {
    const isItemAlreadyAdded = idsInAllocation.includes(id);
    const newIds = [...idsInAllocation];

    if (isItemAlreadyAdded) {
      newIds.splice(newIds.indexOf(id), 1);
    } else {
      newIds.push(id);
    }

    localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(newIds));
    setIdsInAllocation(newIds);
  };

  return [idsInAllocation, onAddRemoveFromAllocate];
}
