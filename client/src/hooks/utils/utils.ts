import { AllocationValues } from 'components/Allocation/types';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

export function getAllocationsMapped(
  allocationValues: AllocationValues,
): { amount: string; proposalAddress: string }[] {
  return allocationValues.map(({ address, value }) => ({
    amount: formatUnitsBigInt(parseUnitsBigInt(value || '0'), 'wei'),
    // proposalAddress is a field required by BE. Do not rename to project.
    proposalAddress: address,
  }));
}
