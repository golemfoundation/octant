import { AllocationsStore } from 'store/models/allocations/types';
import { AllocationValues } from 'views/AllocationView/types';

export default interface AllocationSummaryProps {
  allocationValues: AllocationValues;
  allocations: NonNullable<AllocationsStore>;
}
