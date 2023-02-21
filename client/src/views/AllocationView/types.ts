import { BigNumber } from 'ethers';

import { AllocationsStore } from 'store/models/allocations/types';

export type CurrentView = 'edit' | 'summary';

export interface AllocationValues {
  [key: string]: undefined | string;
}

export type AllocationWithPositiveValue = {
  proposalAddress: string;
  value: string;
};

export type AllocationWithPositiveValueBigNumber = {
  proposalAddress: string;
  value: BigNumber;
};

export interface StateProps {
  allocations: NonNullable<AllocationsStore>;
}

export default interface AllocationViewProps extends StateProps {}
