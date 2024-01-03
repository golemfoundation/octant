import { formatUnits, parseUnits } from 'ethers/lib/utils';

import { AllocationValues } from 'views/AllocationView/types';

export function getAllocationsMapped(
  allocations: AllocationValues,
): { amount: string; proposalAddress: string }[] {
  return allocations.map(({ address, value }) => ({
    amount: formatUnits(parseUnits(value), 'wei'),
    proposalAddress: address,
  }));
}
