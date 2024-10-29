import { UserAllocationElement } from 'hooks/queries/useUserAllocations';

export type UserAllocationElementString = Omit<UserAllocationElement, 'value'> & {
  value: string;
};

export type PercentageProportions = {
  [key: string]: number;
};

export type AllocationValue = {
  address: string;
  value: string;
};

export type AllocationValues = AllocationValue[];

export type AllocationWithPositiveValueBigInt = {
  projectAddress: string;
  value: bigint;
};
