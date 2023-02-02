import { BigNumber } from 'ethers';

import { AllocationSquashed } from 'hooks/subgraph/useAllocations';

export const mockedAllocationSquashed1: AllocationSquashed = {
  amount: BigNumber.from('12000000000000'),
  array: [
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: 'Allocated',
      allocation: '8000000000000',
      blockTimestamp: '3',
      proposalId: '1',
    },
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: 'Allocated',
      allocation: '4000000000000',
      blockTimestamp: '3',
      proposalId: '2',
    },
  ],
  blockTimestamp: 3,
  type: 'Allocated',
};

export const mockedAllocationSquashed2: AllocationSquashed = {
  amount: BigNumber.from('36000000000000'),
  array: [
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: 'Allocated',
      allocation: '24000000000000',
      blockTimestamp: '4',
      proposalId: '1',
    },
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: 'Allocated',
      allocation: '12000000000000',
      blockTimestamp: '4',
      proposalId: '2',
    },
  ],
  blockTimestamp: 4,
  type: 'Allocated',
};
