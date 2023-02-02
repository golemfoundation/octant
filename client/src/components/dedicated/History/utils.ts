import { AllocationSquashed } from 'hooks/subgraph/useAllocations';
import { Deposit } from 'hooks/subgraph/useDeposits';

export function sortAllocationsAndDeposits(
  elements: (AllocationSquashed | Deposit)[],
): (AllocationSquashed | Deposit)[] {
  return elements.sort(
    ({ blockTimestamp: blockTimestampA }, { blockTimestamp: blockTimestampB }) => {
      if (blockTimestampA < blockTimestampB) {
        return 1;
      }
      if (blockTimestampA > blockTimestampB) {
        return -1;
      }
      return 0;
    },
  );
}
