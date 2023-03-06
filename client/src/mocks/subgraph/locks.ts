import { Lock } from 'hooks/subgraph/useLocks';

export const mockedLock1: Lock = {
  amount: '100000000000000000000',
  blockTimestamp: 1,
  type: 'Lock',
};

export const mockedLock2: Lock = {
  ...mockedLock1,
  blockTimestamp: 2,
};
