// eslint-disable-next-line import/no-extraneous-dependencies
import { act, renderHook } from '@testing-library/react';

import { mockedProposal1, mockedProposal2, mockedProposal3 } from 'mocks/proposals';

import useIdsInAllocation from '.';

import { getProposalsIdsForTest } from './utils';

jest.mock('use-metamask', () => ({
  useMetamask: jest.fn().mockReturnValue({ metaState: { isConnected: true } }),
}));
jest.mock('hooks/useUserVote', () =>
  jest.fn().mockReturnValue({ data: { alpha: 0, proposalId: 0 } }),
);

describe('useIdsInAllocation', () => {
  describe('properly populates its state with ids when wallet and user vote are available', () => {
    it('proposals passed to the hook are the same as those already saved in localStorage', () => {
      const proposalsFetched = [mockedProposal1, mockedProposal2];
      const { proposalsIdsInLocalStorage } = getProposalsIdsForTest(proposalsFetched, [
        mockedProposal1,
        mockedProposal2,
      ]);
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      expect(result.current[0]).toEqual(proposalsIdsInLocalStorage);
    });

    it('proposals passed to the hook are different than those already saved in localStorage (fetched less, validation removes elements from LS)', () => {
      const proposalsFetched = [mockedProposal1];
      const { proposalsFetchedIds } = getProposalsIdsForTest(proposalsFetched, [
        mockedProposal1,
        mockedProposal2,
      ]);
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      expect(result.current[0]).toEqual(proposalsFetchedIds);
    });

    it('proposals passed to the hook are different than those already saved in localStorage (fetched more, validation passes everything)', () => {
      const proposalsFetched = [mockedProposal1, mockedProposal2, mockedProposal3];
      const { proposalsIdsInLocalStorage } = getProposalsIdsForTest(proposalsFetched, [
        mockedProposal1,
        mockedProposal2,
      ]);
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      expect(result.current[0]).toEqual(proposalsIdsInLocalStorage);
    });
  });

  describe('properly adds and removes elements to/from its state', () => {
    it('adds', () => {
      const proposalsFetched = [mockedProposal1, mockedProposal2];
      const { proposalsIdsInLocalStorage } = getProposalsIdsForTest(proposalsFetched, [
        mockedProposal1,
        mockedProposal2,
      ]);
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      act(() => result.current[1](5));
      expect(result.current[0]).toEqual([...proposalsIdsInLocalStorage, 5]);
    });

    it('removes', () => {
      const proposalsFetched = [mockedProposal1, mockedProposal2];
      getProposalsIdsForTest(proposalsFetched, [mockedProposal1, mockedProposal2]);
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      act(() => result.current[1](1));
      expect(result.current[0]).toEqual([2]);
    });
  });
});
