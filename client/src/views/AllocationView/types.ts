import { AllocationsStore } from 'store/models/allocations/types';

export type CurrentView = 'edit' | 'summary';

export interface AllocationValues {
  [key: number]: undefined | string;
}

export interface AllocationValuesDefined {
  [key: number]: number;
}

export interface StateProps {
  allocations: NonNullable<AllocationsStore>;
}

export default interface AllocationViewProps extends StateProps {}
