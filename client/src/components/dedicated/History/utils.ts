import { AllocationSquashed } from 'hooks/subgraph/useAllocations';
import { Deposit } from 'hooks/subgraph/useLocks';
import { Withdrawn } from 'hooks/subgraph/useUnlocks';

export function sortAllocationsAndLocks(
  elements: (AllocationSquashed | Deposit | Withdrawn)[],
): (AllocationSquashed | Deposit | Withdrawn)[] {
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
