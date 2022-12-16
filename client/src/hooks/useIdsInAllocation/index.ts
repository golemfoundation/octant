import { useEffect, useState } from 'react';
import { useMetamask } from 'use-metamask';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import { ExtendedProposal } from 'types/proposals';
import { onAddRemoveAllocationElementLocalStorage } from 'hooks/utils';
import useUserVote from 'hooks/useUserVote';

import { toastDebouncedOnlyOneItemAllowed } from './utils';

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
    // TODO Remove userVote.alpha > 0 check following https://wildlandio.atlassian.net/browse/HEX-108.
    if (
      userVote &&
      userVote.proposalId === id &&
      userVote.alpha > 0 &&
      idsInAllocation!.includes(userVote.proposalId)
    ) {
      toastDebouncedOnlyOneItemAllowed();
      return;
    }
    const newIds = onAddRemoveAllocationElementLocalStorage(idsInAllocation!, id);
    setIdsInAllocation(newIds);
  };

  useEffect(() => {
    if (
      isConnected &&
      userVote &&
      userVote.proposalId &&
      userVote.alpha > 0 &&
      !!idsInAllocation &&
      !idsInAllocation.includes(userVote.proposalId)
    ) {
      onAddRemoveFromAllocate(userVote.proposalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userVote, idsInAllocation]);

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
      setIdsInAllocation([]);
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
