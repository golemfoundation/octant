import {
  mockedProposalA,
  mockedProposalB,
  mockedProposalC,
  mockedProposalBNoAllocation,
  mockedProposalD,
  mockedProposalCNoAllocation,
  mockedProposalDNoAllocation,
  mockedProposalANoAllocation,
  mockedProposalAHigherAllocation,
} from 'mocks/subgraph/proposals';

import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from './getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

describe('getSortedElementsByTotalValueOfAllocationsAndAlphabetical', () => {
  it('properly sorts elements', () => {
    expect(
      getSortedElementsByTotalValueOfAllocationsAndAlphabetical([
        mockedProposalA,
        mockedProposalB,
        mockedProposalAHigherAllocation,
        mockedProposalC,
        mockedProposalB,
        mockedProposalA,
        mockedProposalBNoAllocation,
        mockedProposalD,
        mockedProposalCNoAllocation,
        mockedProposalDNoAllocation,
        mockedProposalANoAllocation,
        mockedProposalAHigherAllocation,
      ]),
    ).toEqual([
      mockedProposalD,
      mockedProposalC,
      mockedProposalAHigherAllocation,
      mockedProposalAHigherAllocation,
      mockedProposalB,
      mockedProposalB,
      mockedProposalA,
      mockedProposalA,
      mockedProposalANoAllocation,
      mockedProposalBNoAllocation,
      mockedProposalCNoAllocation,
      mockedProposalDNoAllocation,
    ]);
  });
});
