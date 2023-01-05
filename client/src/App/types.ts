import {
  AllocationAddPayload,
  AllocationsAddPayload,
  AllocationsStore,
} from 'store/models/allocations/types';

export interface StateProps {
  allocations: AllocationsStore;
}

export interface DispatchProps {
  onAddAllocation: (payload: AllocationAddPayload) => void;
  onAddAllocations: (payload: AllocationsAddPayload) => void;
}

export default interface AppProps extends StateProps, DispatchProps {}
