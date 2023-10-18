import { AllocationValues } from 'views/AllocationView/types';

export function getAllocationsMapped(
  allocations: AllocationValues,
): { amount: string; proposalAddress: string }[] {
  return allocations.map(({ address, value }) => ({
    amount: value.toString(),
    proposalAddress: address,
  }));
}
