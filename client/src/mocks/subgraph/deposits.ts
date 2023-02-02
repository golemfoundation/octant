import { Deposit } from 'hooks/subgraph/useDeposits';

export const mockedDeposit1: Deposit = {
  amount: '100000000000000000000',
  blockTimestamp: 1,
  type: 'Deposited',
};

export const mockedDeposit2: Deposit = {
  ...mockedDeposit1,
  blockTimestamp: 2,
};
