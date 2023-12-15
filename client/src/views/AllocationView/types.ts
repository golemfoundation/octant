import { BigNumber } from 'ethers';

export type AllocationValues = {
  address: string;
  value: BigNumber;
}[];

export type AllocationWithPositiveValueBigNumber = {
  proposalAddress: string;
  value: BigNumber;
};
