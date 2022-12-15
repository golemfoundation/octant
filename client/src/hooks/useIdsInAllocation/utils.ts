import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import { ExtendedProposal } from 'types/proposals';

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
