import { mockedAllocationSquashed1, mockedAllocationSquashed2 } from 'mocks/subgraph/allocations';
import { mockedDeposit1, mockedDeposit2 } from 'mocks/subgraph/deposits';

import { sortAllocationsAndDeposits } from './utils';

describe('sortAllocationsAndDeposits', () => {
  it('properly sorts allocations and deposits based on their blockTimestamp field', () => {
    expect(
      sortAllocationsAndDeposits([
        mockedDeposit1,
        mockedDeposit2,
        mockedAllocationSquashed1,
        mockedAllocationSquashed2,
      ]),
    ).toEqual([
      mockedAllocationSquashed2,
      mockedAllocationSquashed1,
      mockedDeposit2,
      mockedDeposit1,
    ]);
  });
});
