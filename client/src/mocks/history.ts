import { BigNumber } from 'ethers';

import { TransactionPending } from 'store/meta/types';

export const transactionPending1: TransactionPending = {
  amount: BigNumber.from(10),
  hash: '0x123',
  isFetching: false,
  timestamp: '100',
  type: 'lock',
};

export const transactionPending2: TransactionPending = {
  amount: BigNumber.from(20),
  hash: '0x456',
  isFetching: false,
  timestamp: '200',
  type: 'lock',
};

export const transactionPending3: TransactionPending = {
  amount: BigNumber.from(30),
  hash: '0x789',
  isFetching: false,
  timestamp: '300',
  type: 'lock',
};
