import AllocationSummaryProps from 'components/dedicated/AllocationSummary/types';
import { AllocationValues } from 'views/AllocationView/types';

export default interface ExpandableListProps {
  allocationValues: AllocationValues;
  allocations: AllocationSummaryProps['allocations'];
}
