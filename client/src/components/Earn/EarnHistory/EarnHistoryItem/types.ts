import { HistoryElement } from 'hooks/queries/useHistory';
import { TransactionPending } from 'store/transactionLocal/types';

export default interface EarnHistoryItemProps extends HistoryElement {
  isFinalized?: TransactionPending['isFinalized'];
  isWaitingForTransactionInitialized?: TransactionPending['isWaitingForTransactionInitialized'];
}
