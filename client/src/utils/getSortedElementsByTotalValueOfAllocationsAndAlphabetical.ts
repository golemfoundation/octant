import { AllocationItemWithAllocations } from 'components/Allocation/AllocationItem/types';
import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

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
  elements: (ProjectIpfsWithRewards | AllocationItemWithAllocations)[],
): (ProjectIpfsWithRewards | AllocationItemWithAllocations)[] {
  return elements.sort(
    (
      { totalValueOfAllocations: totalValueOfAllocationsA, name: nameA },
      { totalValueOfAllocations: totalValueOfAllocationsB, name: nameB },
    ) => {
      /**
       * When added during current epoch projects do not have totalValueOfAllocations defined.
       * In such case, do not sort them, leaving them at the end of the list.
       */
      if (!totalValueOfAllocationsA && totalValueOfAllocationsB) {
        return 1;
      }
      if (totalValueOfAllocationsA && !totalValueOfAllocationsB) {
        return -1;
      }
      if (!totalValueOfAllocationsA || !totalValueOfAllocationsB) {
        return compareNames(nameA, nameB);
      }
      if (totalValueOfAllocationsA === totalValueOfAllocationsB) {
        return compareNames(nameA, nameB);
      }
      if (totalValueOfAllocationsA < totalValueOfAllocationsB!) {
        return 1;
      }
      if (totalValueOfAllocationsA > totalValueOfAllocationsB!) {
        return -1;
      }
      return 0;
    },
  );
}
