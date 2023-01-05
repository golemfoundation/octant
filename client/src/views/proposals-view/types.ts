import { AllocationsStore } from 'store/models/allocations/types';

export interface StateProps {
  allocations: NonNullable<AllocationsStore>;
}

export default interface ProposalsViewProps extends StateProps {}
