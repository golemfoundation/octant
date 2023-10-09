import { BigNumber } from 'ethers';

import { TransactionPending } from 'store/meta/types';

export const transactionPending1: TransactionPending = {
  amount: BigNumber.from(10),
  isWaitingForTransaction: false,
  timestamp: '100',
  transactionHash: '0x123',
  type: 'lock',
};

export const transactionPending2: TransactionPending = {
  amount: BigNumber.from(20),
  isWaitingForTransaction: false,
  timestamp: '200',
  transactionHash: '0x456',
  type: 'lock',
};

export const transactionPending3: TransactionPending = {
  amount: BigNumber.from(30),
  isWaitingForTransaction: false,
  timestamp: '300',
  transactionHash: '0x789',
  type: 'lock',
};
