import TransactionDetailsProps from 'components/Home/HomeGridTransactions/ModalTransactionDetails/TransactionDetails/types';
import { AllocationEventTypeParsed } from 'hooks/queries/useHistory';

type TransactionDetailsAllocationProps = Omit<TransactionDetailsProps, 'eventData'> & {
  eventData: AllocationEventTypeParsed & { amount: bigint };
};

export default TransactionDetailsAllocationProps;
