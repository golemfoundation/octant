import { TransactionPending } from 'store/transactionLocal/types';

export const transactionPending1: TransactionPending = {
  amount: BigInt(10),
  isFinalized: false,
  isWaitingForTransactionInitialized: false,
  timestamp: '100',
  transactionHash: '0x123',
  type: 'lock',
};

export const transactionPending2: TransactionPending = {
  amount: BigInt(20),
  isFinalized: false,
  isWaitingForTransactionInitialized: false,
  timestamp: '200',
  transactionHash: '0x456',
  type: 'lock',
};

export const transactionPending3: TransactionPending = {
  amount: BigInt(30),
  isFinalized: false,
  isWaitingForTransactionInitialized: false,
  timestamp: '300',
  transactionHash: '0x789',
  type: 'lock',
};
