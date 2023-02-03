import { AllocationSquashed } from 'hooks/subgraph/useAllocations';
import { Deposit } from 'hooks/subgraph/useDeposits';
import { Undeposit } from 'hooks/subgraph/useUndeposits';

export function sortAllocationsAndDeposits(
  elements: (AllocationSquashed | Deposit | Undeposit)[],
): (AllocationSquashed | Deposit | Undeposit)[] {
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
