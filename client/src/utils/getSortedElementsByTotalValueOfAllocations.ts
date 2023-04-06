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
