import {
  mockedProposalATotalValueOfAllocations1,
  mockedProposalBTotalValueOfAllocations2,
  mockedProposalBTotalValueOfAllocationsUndefined,
  mockedProposalDTotalValueOfAllocationsUndefined,
  mockedProposalCTotalValueOfAllocationsUndefined,
  mockedProposalATotalValueOfAllocations2,
  mockedProposalATotalValueOfAllocationsUndefined,
  mockedProposalCTotalValueOfAllocations3,
  mockedProposalDTotalValueOfAllocations4,
} from 'mocks/subgraph/proposals';

import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from './getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

const expectedValueRoot = [
  mockedProposalDTotalValueOfAllocations4,
  mockedProposalCTotalValueOfAllocations3,
  mockedProposalATotalValueOfAllocations2,
  mockedProposalATotalValueOfAllocations2,
  mockedProposalBTotalValueOfAllocations2,
  mockedProposalBTotalValueOfAllocations2,
  mockedProposalATotalValueOfAllocations1,
  mockedProposalATotalValueOfAllocations1,
  mockedProposalATotalValueOfAllocationsUndefined,
  mockedProposalBTotalValueOfAllocationsUndefined,
  mockedProposalCTotalValueOfAllocationsUndefined,
  mockedProposalDTotalValueOfAllocationsUndefined,
];

const testCases = [
  {
    argument: [
      mockedProposalATotalValueOfAllocations1,
      mockedProposalBTotalValueOfAllocations2,
      mockedProposalATotalValueOfAllocations2,
      mockedProposalCTotalValueOfAllocations3,
      mockedProposalBTotalValueOfAllocations2,
      mockedProposalATotalValueOfAllocations1,
      mockedProposalBTotalValueOfAllocationsUndefined,
      mockedProposalDTotalValueOfAllocations4,
      mockedProposalCTotalValueOfAllocationsUndefined,
      mockedProposalDTotalValueOfAllocationsUndefined,
      mockedProposalATotalValueOfAllocationsUndefined,
      mockedProposalATotalValueOfAllocations2,
    ],
    expectedValue: expectedValueRoot,
  },
  {
    argument: [
      mockedProposalBTotalValueOfAllocationsUndefined,
      mockedProposalATotalValueOfAllocations1,
      mockedProposalBTotalValueOfAllocations2,
      mockedProposalATotalValueOfAllocations2,
      mockedProposalCTotalValueOfAllocations3,
      mockedProposalBTotalValueOfAllocations2,
      mockedProposalATotalValueOfAllocations1,
      mockedProposalDTotalValueOfAllocations4,
      mockedProposalCTotalValueOfAllocationsUndefined,
      mockedProposalDTotalValueOfAllocationsUndefined,
      mockedProposalATotalValueOfAllocationsUndefined,
      mockedProposalATotalValueOfAllocations2,
    ],
    expectedValue: expectedValueRoot,
  },
  {
    argument: [
      mockedProposalBTotalValueOfAllocationsUndefined,
      mockedProposalCTotalValueOfAllocationsUndefined,
      mockedProposalATotalValueOfAllocations1,
      mockedProposalBTotalValueOfAllocations2,
      mockedProposalATotalValueOfAllocations2,
      mockedProposalCTotalValueOfAllocations3,
      mockedProposalBTotalValueOfAllocations2,
      mockedProposalDTotalValueOfAllocationsUndefined,
      mockedProposalATotalValueOfAllocationsUndefined,
      mockedProposalATotalValueOfAllocations1,
      mockedProposalDTotalValueOfAllocations4,
      mockedProposalATotalValueOfAllocations2,
    ],
    expectedValue: expectedValueRoot,
  },
];

describe('getSortedElementsByTotalValueOfAllocationsAndAlphabetical', () => {
  for (const { argument, expectedValue } of testCases) {
    it('properly returns expectedValue', () => {
      expect(getSortedElementsByTotalValueOfAllocationsAndAlphabetical(argument)).toEqual(
        expectedValue,
      );
    });
  }
});
