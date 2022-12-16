// eslint-disable-next-line import/no-extraneous-dependencies
import { act, renderHook } from '@testing-library/react';

import { mockedProposal1, mockedProposal2, mockedProposal3 } from 'mocks/proposals';

import useIdsInAllocation from '.';

import { getProposalsIdsForTest } from './utils';

import useUserVote from '../useUserVote';

jest.mock('use-metamask', () => ({
  useMetamask: jest.fn().mockReturnValue({ metaState: { isConnected: true } }),
}));
jest.mock('hooks/useUserVote', () => jest.fn());

describe('useIdsInAllocation', () => {
  describe('properly populates its state with ids when wallet and user vote are available', () => {
    beforeEach(() => {
      // @ts-expect-error useUserVote here is jest mock with other properties.
      useUserVote.mockReturnValue({ data: { alpha: 0, proposalId: 0 } });
    });

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

    it('adds user vote to the state when it has positive alpha and is not in LS', () => {
      // @ts-expect-error useUserVote here is jest mock with other properties.
      useUserVote.mockReturnValue({ data: { alpha: 10, proposalId: 100 } });
      const proposalsFetched = [mockedProposal1, mockedProposal2, mockedProposal3];
      const { proposalsIdsInLocalStorage } = getProposalsIdsForTest(proposalsFetched, [
        mockedProposal1,
        mockedProposal2,
      ]);
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      expect(result.current[0]).toEqual([...proposalsIdsInLocalStorage, 100]);
    });

    it('does not add user vote to the state when it has 0 alpha and is not in LS', () => {
      // TODO Remove this test following https://wildlandio.atlassian.net/browse/HEX-108.
      // @ts-expect-error useUserVote here is jest mock with other properties.
      useUserVote.mockReturnValue({ data: { alpha: 10, proposalId: 0 } });
      const proposalsFetched = [mockedProposal1, mockedProposal2, mockedProposal3];
      const { proposalsIdsInLocalStorage } = getProposalsIdsForTest(proposalsFetched, [
        mockedProposal1,
        mockedProposal2,
      ]);
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      expect(result.current[0]).toEqual([...proposalsIdsInLocalStorage]);
    });
  });

  describe('properly returns undefined whenever wallet is connected, but userVote is not available', () => {
    beforeEach(() => {
      // @ts-expect-error Jest adds mockImplementation to the mock here.
      useUserVote.mockImplementation(() => ({ data: undefined }));
    });

    it('proposals passed to the hook are the same as those already saved in localStorage', () => {
      const proposalsFetched = [mockedProposal1, mockedProposal2];
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      expect(result.current[0]).toEqual(undefined);
    });

    it('proposals passed to the hook are different than those already saved in localStorage (fetched less, validation removes elements from LS)', () => {
      const proposalsFetched = [mockedProposal1];
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      expect(result.current[0]).toEqual(undefined);
    });

    it('proposals passed to the hook are different than those already saved in localStorage (fetched more, validation passes everything)', () => {
      const proposalsFetched = [mockedProposal1, mockedProposal2, mockedProposal3];
      const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
      expect(result.current[0]).toEqual(undefined);
    });
  });

  describe('properly adds and removes elements to/from its state', () => {
    beforeEach(() => {
      // @ts-expect-error useUserVote here is jest mock with other properties.
      useUserVote.mockReturnValue({ data: { alpha: 0, proposalId: 0 } });
    });

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
