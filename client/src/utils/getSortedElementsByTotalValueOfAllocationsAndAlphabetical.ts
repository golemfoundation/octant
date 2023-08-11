import { AllocationItemWithAllocations } from 'components/dedicated/AllocationItem/types';
import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

const compareNames = (nameA: string | undefined, nameB: string | undefined) => {
  if (!nameA || !nameB) {
    return 0;
  }
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

export default function getSortedElementsByTotalValueOfAllocationsAndAlphabetical(
  elements: (ProposalIpfsWithRewards | AllocationItemWithAllocations)[],
): (ProposalIpfsWithRewards | AllocationItemWithAllocations)[] {
  return elements.sort(
    (
      { totalValueOfAllocations: totalValueOfAllocationsA, name: nameA },
      { totalValueOfAllocations: totalValueOfAllocationsB, name: nameB },
    ) => {
      /**
       * When added during current epoch proposals do not have totalValueOfAllocations defined.
       * In such case, do not sort them, leaving them at the end of the list.
       */
      if (!totalValueOfAllocationsA || !totalValueOfAllocationsB) {
        return compareNames(nameA, nameB);
      }
      if (totalValueOfAllocationsA.eq(totalValueOfAllocationsB)) {
        return compareNames(nameA, nameB);
      }
      if (totalValueOfAllocationsA.lt(totalValueOfAllocationsB!)) {
        return 1;
      }
      if (totalValueOfAllocationsA.gt(totalValueOfAllocationsB!)) {
        return -1;
      }
      return 0;
    },
  );
}
