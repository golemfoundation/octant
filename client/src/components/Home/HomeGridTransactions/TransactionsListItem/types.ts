import { HistoryElement, EventData } from 'hooks/queries/useHistory';
import { TransactionPending } from 'store/transactionLocal/types';

type TransactionsListItemProps = Omit<HistoryElement, 'eventData'> & {
  eventData: Partial<EventData> & { amount: bigint };
} & {
  isFinalized?: TransactionPending['isFinalized'];
  isMultisig?: boolean;
  isWaitingForTransactionInitialized?: TransactionPending['isWaitingForTransactionInitialized'];
};

export default TransactionsListItemProps;
