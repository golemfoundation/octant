import { BigNumber } from 'ethers';

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
