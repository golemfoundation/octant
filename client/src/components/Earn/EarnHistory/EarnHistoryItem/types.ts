import { HistoryElement, EventData } from 'hooks/queries/useHistory';
import { TransactionPending } from 'store/transactionLocal/types';

type EarnHistoryItemProps = Omit<HistoryElement, 'eventData'> & {
  eventData: Partial<EventData> & { amount: bigint };
} & {
  isFinalized?: TransactionPending['isFinalized'];
  isLast: boolean;
  isMultisig?: boolean;
  isWaitingForTransactionInitialized?: TransactionPending['isWaitingForTransactionInitialized'];
};

export default EarnHistoryItemProps;
