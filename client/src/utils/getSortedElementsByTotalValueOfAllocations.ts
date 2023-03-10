import { AllocationItemWithAllocations } from 'components/dedicated/AllocationItem/types';
import { ProposalWithAllocations } from 'components/dedicated/ProposalItem/types';

export default function getSortedElementsByTotalValueOfAllocations(
  elements: (ProposalWithAllocations | AllocationItemWithAllocations)[],
): (ProposalWithAllocations | AllocationItemWithAllocations)[] {
  return elements.sort(
    (
      { totalValueOfAllocations: totalValueOfAllocationsA },
      { totalValueOfAllocations: totalValueOfAllocationsB },
    ) => {
      if (totalValueOfAllocationsA!.lt(totalValueOfAllocationsB!)) {
        return 1;
      }
      if (totalValueOfAllocationsA!.gt(totalValueOfAllocationsB!)) {
        return -1;
      }
      return 0;
    },
  );
}
