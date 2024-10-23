import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';
import {
  mockedProjectATotalValueOfAllocations1,
  mockedProjectBTotalValueOfAllocations2,
  mockedProjectBTotalValueOfAllocationsUndefined,
  mockedProjectDTotalValueOfAllocationsUndefined,
  mockedProjectCTotalValueOfAllocationsUndefined,
  mockedProjectATotalValueOfAllocations2,
  mockedProjectATotalValueOfAllocationsUndefined,
  mockedProjectCTotalValueOfAllocations3,
  mockedProjectDTotalValueOfAllocations4,
} from 'mocks/subgraph/projects';

import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from './getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

const expectedValueRoot = [
  mockedProjectDTotalValueOfAllocations4,
  mockedProjectCTotalValueOfAllocations3,
  mockedProjectATotalValueOfAllocations2,
  mockedProjectATotalValueOfAllocations2,
  mockedProjectBTotalValueOfAllocations2,
  mockedProjectBTotalValueOfAllocations2,
  mockedProjectATotalValueOfAllocations1,
  mockedProjectATotalValueOfAllocations1,
  mockedProjectATotalValueOfAllocationsUndefined,
  mockedProjectBTotalValueOfAllocationsUndefined,
  mockedProjectCTotalValueOfAllocationsUndefined,
  mockedProjectDTotalValueOfAllocationsUndefined,
];

const testCases = [
  {
    argument: [
      mockedProjectATotalValueOfAllocations1,
      mockedProjectBTotalValueOfAllocations2,
      mockedProjectATotalValueOfAllocations2,
      mockedProjectCTotalValueOfAllocations3,
      mockedProjectBTotalValueOfAllocations2,
      mockedProjectATotalValueOfAllocations1,
      mockedProjectBTotalValueOfAllocationsUndefined,
      mockedProjectDTotalValueOfAllocations4,
      mockedProjectCTotalValueOfAllocationsUndefined,
      mockedProjectDTotalValueOfAllocationsUndefined,
      mockedProjectATotalValueOfAllocationsUndefined,
      mockedProjectATotalValueOfAllocations2,
    ],
    expectedValue: expectedValueRoot,
  },
  {
    argument: [
      mockedProjectBTotalValueOfAllocationsUndefined,
      mockedProjectATotalValueOfAllocations1,
      mockedProjectBTotalValueOfAllocations2,
      mockedProjectATotalValueOfAllocations2,
      mockedProjectCTotalValueOfAllocations3,
      mockedProjectBTotalValueOfAllocations2,
      mockedProjectATotalValueOfAllocations1,
      mockedProjectDTotalValueOfAllocations4,
      mockedProjectCTotalValueOfAllocationsUndefined,
      mockedProjectDTotalValueOfAllocationsUndefined,
      mockedProjectATotalValueOfAllocationsUndefined,
      mockedProjectATotalValueOfAllocations2,
    ],
    expectedValue: expectedValueRoot,
  },
  {
    argument: [
      mockedProjectBTotalValueOfAllocationsUndefined,
      mockedProjectCTotalValueOfAllocationsUndefined,
      mockedProjectATotalValueOfAllocations1,
      mockedProjectBTotalValueOfAllocations2,
      mockedProjectATotalValueOfAllocations2,
      mockedProjectCTotalValueOfAllocations3,
      mockedProjectBTotalValueOfAllocations2,
      mockedProjectDTotalValueOfAllocationsUndefined,
      mockedProjectATotalValueOfAllocationsUndefined,
      mockedProjectATotalValueOfAllocations1,
      mockedProjectDTotalValueOfAllocations4,
      mockedProjectATotalValueOfAllocations2,
    ],
    expectedValue: expectedValueRoot,
  },
];

describe('getSortedElementsByTotalValueOfAllocationsAndAlphabetical', () => {
  for (const { argument, expectedValue } of testCases) {
    it('properly returns expectedValue', () => {
      expect(
        getSortedElementsByTotalValueOfAllocationsAndAlphabetical(
          argument as ProjectIpfsWithRewards[],
        ),
      ).toEqual(expectedValue);
    });
  }
});
