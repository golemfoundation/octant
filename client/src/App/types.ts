import { AllocationsAddPayload, AllocationsStore } from 'store/models/allocations/types';

export interface StateProps {
  allocations: AllocationsStore;
}

export interface DispatchProps {
  onSetAllocations: (payload: AllocationsAddPayload) => void;
}

export default interface AppProps extends StateProps, DispatchProps {}
