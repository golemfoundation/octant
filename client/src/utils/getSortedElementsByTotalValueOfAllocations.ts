import { AllocationItemWithAllocations } from 'components/dedicated/AllocationItem/types';
import { ProposalWithRewards } from 'hooks/queries/useProposalsWithRewards';

export default function getSortedElementsByTotalValueOfAllocations(
  elements: (ProposalWithRewards | AllocationItemWithAllocations)[],
): (ProposalWithRewards | AllocationItemWithAllocations)[] {
  return elements.sort(
    (
      { totalValueOfAllocations: totalValueOfAllocationsA },
      { totalValueOfAllocations: totalValueOfAllocationsB },
    ) => {
      /**
       * When added during current epoch proposals do not have totalValueOfAllocations defined.
       * In such case, do not sort them, leaving them at the end of the list.
       */
      if (!totalValueOfAllocationsA || !totalValueOfAllocationsB) {
        return 0;
      }
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
