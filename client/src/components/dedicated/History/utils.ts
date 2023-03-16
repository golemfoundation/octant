import { AllocationSquashed } from 'hooks/subgraph/allocations/types';
import { Lock } from 'hooks/subgraph/useLocks';
import { Unlock } from 'hooks/subgraph/useUnlocks';

export function sortAllocationsAndLocks(
  elements: (AllocationSquashed | Lock | Unlock)[],
): (AllocationSquashed | Lock | Unlock)[] {
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
