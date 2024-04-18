import { HistoryElement } from 'hooks/queries/useHistory';
import { TransactionPending } from 'store/transactionLocal/types';

type EarnHistoryItemProps = HistoryElement & {
  isFinalized?: TransactionPending['isFinalized'];
  isLast: boolean;
  isMultisig?: boolean;
  isWaitingForTransactionInitialized?: TransactionPending['isWaitingForTransactionInitialized'];
};

export default EarnHistoryItemProps;
