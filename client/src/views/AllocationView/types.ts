import { BigNumber } from 'ethers';

import { UserAllocationElement } from 'hooks/queries/useUserAllocations';

export type UserAllocationElementString = Omit<UserAllocationElement, 'value'> & {
  value: string;
};

export type CurrentView = 'edit' | 'summary';

export type PercentageProportions = {
  [key: string]: number;
};

export type AllocationValue = {
  address: string;
  value: string;
};

export type AllocationValues = AllocationValue[];

export type AllocationWithPositiveValueBigNumber = {
  proposalAddress: string;
  value: BigNumber;
};
