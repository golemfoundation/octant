import { HistoryElement } from 'hooks/queries/useHistory';
import { TransactionPending } from 'store/transactionLocal/types';

export default interface HistoryItemProps extends HistoryElement {
  isFinalized?: TransactionPending['isFinalized'];
  isWaitingForTransactionInitialized?: TransactionPending['isWaitingForTransactionInitialized'];
}
