import { ApiPostAllocateLeverageResponse } from 'api/calls/allocate';

export default interface AllocationSummaryProps {
  allocationSimulated?: ApiPostAllocateLeverageResponse;
  isLoadingAllocateSimulate: boolean;
}
