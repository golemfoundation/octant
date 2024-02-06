import { formatUnits, parseUnits } from 'ethers/lib/utils';

import { AllocationValues } from 'views/AllocationView/types';

export function getAllocationsMapped(
  allocationValues: AllocationValues,
): { amount: string; proposalAddress: string }[] {
  return allocationValues.map(({ address, value }) => ({
    amount: formatUnits(parseUnits(value || '0'), 'wei'),
    proposalAddress: address,
  }));
}
