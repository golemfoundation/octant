import { BigNumber } from 'ethers';

export type Allocation = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: 'Allocated';
  address: string;
  allocation: string;
  blockTimestamp: string;
  user: string;
};

export type AllocationSquashed = {
  amount: BigNumber;
  array: Allocation[];
  blockTimestamp: number;
  type: 'Allocated';
  user: string;
};
