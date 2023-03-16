import { BigNumber } from 'ethers';

import { AllocationSquashed } from 'hooks/subgraph/allocations/types';

export const mockedAllocationSquashed1: AllocationSquashed = {
  amount: BigNumber.from('12000000000000'),
  array: [
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: 'Allocated',
      address: '1',
      allocation: '8000000000000',
      blockTimestamp: '3',
      user: 'user',
    },
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: 'Allocated',
      address: '2',
      allocation: '4000000000000',
      blockTimestamp: '3',
      user: 'user',
    },
  ],
  blockTimestamp: 3,
  type: 'Allocated',
  user: 'user',
};

export const mockedAllocationSquashed2: AllocationSquashed = {
  amount: BigNumber.from('36000000000000'),
  array: [
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: 'Allocated',
      address: '1',
      allocation: '24000000000000',
      blockTimestamp: '4',
      user: 'user',
    },
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: 'Allocated',
      address: '2',
      allocation: '12000000000000',
      blockTimestamp: '4',
      user: 'user',
    },
  ],
  blockTimestamp: 4,
  type: 'Allocated',
  user: 'user',
};
