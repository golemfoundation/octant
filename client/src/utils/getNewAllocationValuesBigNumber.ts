import { parseUnits } from 'ethers/lib/utils';

import {
  AllocationWithPositiveValue,
  AllocationWithPositiveValueBigNumber,
} from 'views/AllocationView/types';

export default function getNewAllocationValuesBigNumber(
  elements: AllocationWithPositiveValue[],
): AllocationWithPositiveValueBigNumber[] {
  return elements.map(({ proposalAddress, value }) => ({
    proposalAddress,
    value: parseUnits(value),
  }));
}
