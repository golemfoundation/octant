import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import triggerToast from 'utils/triggerToast';

import { UserVote } from './useUserVote';
import { toastDebouncedCantRemoveVotedProject } from './useIdsInAllocation/utils';

type OnAddRemoveAllocationElementLocalStorage = {
  allocations: number[];
  id: number;
  name: string;
  userVote?: UserVote;
};

export function isProposalAlreadyVotedOn(userVote: undefined | UserVote, id: number): boolean {
  // TODO Remove userVote.alpha > 0 check following https://wildlandio.atlassian.net/browse/HEX-108.
  return !!userVote && userVote.proposalId === id && userVote.alpha > 0;
}

export function onAddRemoveAllocationElementLocalStorage({
  allocations,
  id,
  userVote,
  name,
}: OnAddRemoveAllocationElementLocalStorage): number[] | undefined {
  if (isProposalAlreadyVotedOn(userVote, id) && allocations.includes(userVote!.proposalId)) {
    toastDebouncedCantRemoveVotedProject();
    return;
  }
  const isItemAlreadyAdded = allocations.includes(id);
  const newIds = allocations ? [...allocations] : [];

  if (isItemAlreadyAdded) {
    newIds.splice(newIds.indexOf(id), 1);
    triggerToast({
      title: 'Removed from Allocate',
    });
  } else {
    newIds.push(id);
    triggerToast({
      title: `Added ${name} to Allocate`,
    });
  }

  localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(newIds));

  return newIds;
}
