import { mockedProposal1, mockedProposal2, mockedProposal3 } from 'mocks/subgraph/proposals';

import getSortedElementsByTotalValueOfAllocations from './getSortedElementsByTotalValueOfAllocations';

describe('getSortedElementsByTotalValueOfAllocations', () => {
  it('properly sorts elements', () => {
    expect(
      getSortedElementsByTotalValueOfAllocations([
        mockedProposal1,
        mockedProposal2,
        mockedProposal3,
        mockedProposal2,
        mockedProposal1,
      ]),
    ).toEqual([
      mockedProposal3,
      mockedProposal2,
      mockedProposal2,
      mockedProposal1,
      mockedProposal1,
    ]);
  });
});
