// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook } from '@testing-library/react';

import { mockedProposal1, mockedProposal2, mockedProposal3 } from 'mocks/proposals';

import useIdsInAllocation from '.';

import { getProposalsIdsForTest } from './utils';

jest.mock('use-metamask', () => ({
  useMetamask: jest.fn().mockReturnValue({ metaState: { isConnected: true } }),
}));
jest.mock('hooks/useUserVote', () =>
  jest.fn().mockReturnValue({ data: { alpha: 10, proposalId: 100 } }),
);

describe('useIdsInAllocation', () => {
  it("adds user vote to the state wen it's not in LS", () => {
    const proposalsFetched = [mockedProposal1, mockedProposal2, mockedProposal3];
    const { proposalsIdsInLocalStorage } = getProposalsIdsForTest(proposalsFetched, [
      mockedProposal1,
      mockedProposal2,
    ]);
    const { result } = renderHook(() => useIdsInAllocation(proposalsFetched));
    expect(result.current[0]).toEqual(proposalsIdsInLocalStorage);
  });
});
