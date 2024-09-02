import HistoryItemDetailsProps from 'components/Earn/EarnHistory/EarnHistoryItemDetails/types';
import { AllocationEventTypeParsed } from 'hooks/queries/useHistory';

type TransactionDetailsAllocationProps = Omit<HistoryItemDetailsProps, 'eventData'> & {
  eventData: AllocationEventTypeParsed & { amount: bigint };
};

export default TransactionDetailsAllocationProps;
