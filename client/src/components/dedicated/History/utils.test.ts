import { mockedAllocationSquashed1, mockedAllocationSquashed2 } from 'mocks/subgraph/allocations';
import { mockedLock1, mockedLock2 } from 'mocks/subgraph/locks';

import { sortAllocationsAndLocks } from './utils';

describe('sortAllocationsAndLocks', () => {
  it('properly sorts allocations and locks based on their blockTimestamp field', () => {
    expect(
      sortAllocationsAndLocks([
        mockedLock1,
        mockedLock2,
        mockedAllocationSquashed1,
        mockedAllocationSquashed2,
      ]),
    ).toEqual([mockedAllocationSquashed2, mockedAllocationSquashed1, mockedLock2, mockedLock1]);
  });
});
