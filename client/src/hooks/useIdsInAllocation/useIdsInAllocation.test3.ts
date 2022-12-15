// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook } from '@testing-library/react';

import { mockedProposal1, mockedProposal2, mockedProposal3 } from 'mocks/proposals';
import useUserVote from 'hooks/useUserVote';

import useIdsInAllocation from '.';

jest.mock('use-metamask', () => ({
  useMetamask: jest.fn().mockReturnValue({ metaState: { isConnected: true } }),
}));
jest.mock('hooks/useUserVote', () => jest.fn().mockReturnValue({ data: undefined }));

describe('useIdsInAllocation', () => {
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
});
