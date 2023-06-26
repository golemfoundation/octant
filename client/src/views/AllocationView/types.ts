import { BigNumber } from 'ethers';

export type CurrentView = 'edit' | 'summary';

export type AllocationValues = {
  address: string;
  value: BigNumber;
}[];

export type AllocationWithPositiveValueBigNumber = {
  proposalAddress: string;
  value: BigNumber;
};
