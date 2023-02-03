import { AllocationSquashed } from 'hooks/subgraph/useAllocations';
import { Deposit } from 'hooks/subgraph/useDeposits';
import { Withdrawn } from 'hooks/subgraph/useWithdrawns';

export function sortAllocationsAndDeposits(
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
