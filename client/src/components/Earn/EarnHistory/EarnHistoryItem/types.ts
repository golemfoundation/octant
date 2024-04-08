import { HistoryElement } from 'hooks/queries/useHistory';
import { TransactionPending } from 'store/transactionLocal/types';

export default interface EarnHistoryItemProps extends HistoryElement {
  isFinalized?: TransactionPending['isFinalized'];
  isLast: boolean;
  isMultisig?: boolean;
  isWaitingForTransactionInitialized?: TransactionPending['isWaitingForTransactionInitialized'];
}
