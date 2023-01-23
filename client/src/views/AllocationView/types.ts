import { BigNumber } from 'ethers';

import { AllocationsStore } from 'store/models/allocations/types';

export type CurrentView = 'edit' | 'summary';

export interface AllocationValues {
  [key: number]: undefined | string;
}

export type AllocationWithPositiveValue = {
  proposalId: number;
  value: string;
};

export type AllocationWithPositiveValueBigNumber = {
  proposalId: number;
  value: BigNumber;
};

export interface StateProps {
  allocations: NonNullable<AllocationsStore>;
}

export default interface AllocationViewProps extends StateProps {}
