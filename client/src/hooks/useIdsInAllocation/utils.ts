import debounce from 'lodash/debounce';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import { ExtendedProposal } from 'types/proposals';
import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import triggerToast from 'utils/triggerToast';

export const getProposalsIdsForTest = (
  proposalsFetched: ExtendedProposal[],
  proposalsToPutInLocalStorage: ExtendedProposal[],
): {
  proposalsFetchedIds: number[];
  proposalsIdsInLocalStorage: number[];
} => {
  const proposalsIdsInLocalStorage = proposalsToPutInLocalStorage.map(({ id }) => id.toNumber());
  localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(proposalsIdsInLocalStorage));
  return {
    proposalsFetchedIds: proposalsFetched.map(({ id }) => id.toNumber()),
    proposalsIdsInLocalStorage,
  };
};

export const toastDebouncedOnlyOneItemAllowed = debounce(
  () =>
    triggerToast({
      message:
        'If you want to remove a project from the Allocate view, you need to unallocate funds from it first.',
      title: 'You allocated to this project',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);
