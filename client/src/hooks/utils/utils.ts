import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';
import { AllocationValues } from 'views/AllocationView/types';

export function getAllocationsMapped(
  allocationValues: AllocationValues,
): { amount: string; proposalAddress: string }[] {
  return allocationValues.map(({ address, value }) => ({
    amount: formatUnitsBigInt(parseUnitsBigInt(value || '0'), 'wei'),
    proposalAddress: address,
  }));
}
