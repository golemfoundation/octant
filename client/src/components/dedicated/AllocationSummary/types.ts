import { AllocationsData } from 'store/allocations/types';
import { AllocationValues } from 'views/AllocationView/types';

export default interface AllocationSummaryProps {
  allocationValues: AllocationValues;
  allocations: NonNullable<AllocationsData>;
}
