import { ApiPostAllocateLeverageResponse } from 'api/calls/allocate';
import { AllocationValues } from 'views/AllocationView/types';

export default interface AllocationSummaryProps {
  allocationSimulated?: ApiPostAllocateLeverageResponse;
  allocationValues: AllocationValues;
  isLoadingAllocateSimulate: boolean;
}
