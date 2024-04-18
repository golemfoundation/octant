import { TransactionPending } from 'store/transactionLocal/types';

export const transactionPending1: TransactionPending = {
  eventData: {
    amount: BigInt(10),
    transactionHash: '0x123',
  },
  isFinalized: false,
  isWaitingForTransactionInitialized: false,
  timestamp: '100',
  type: 'lock',
};

export const transactionPending2: TransactionPending = {
  eventData: {
    amount: BigInt(20),
    transactionHash: '0x456',
  },
  isFinalized: false,
  isWaitingForTransactionInitialized: false,
  timestamp: '200',
  type: 'lock',
};

export const transactionPending3: TransactionPending = {
  eventData: {
    amount: BigInt(30),
    transactionHash: '0x789',
  },
  isFinalized: false,
  isWaitingForTransactionInitialized: false,
  timestamp: '300',
  type: 'lock',
};
