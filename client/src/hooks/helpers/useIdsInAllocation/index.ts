import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import { AllocationsData } from 'store/allocations/types';
import { ExtendedProposal } from 'types/proposals';

import { onAddRemoveAllocationElementLocalStorage } from './utils';

export default function useIdsInAllocation({
  allocations,
  proposals,
  proposalName,
}: {
  allocations: NonNullable<AllocationsData>;
  proposalName?: string;
  proposals?: ExtendedProposal[];
}): { onAddRemoveFromAllocate: (address: string) => void } {
  const { data: userAllocations } = useUserAllocations();
  const { setAllocations } = useAllocationsStore();

  const onAddRemoveFromAllocate = (address: string) => {
    const newIds = onAddRemoveAllocationElementLocalStorage({
      address,
      allocations,
      name:
        proposalName ||
        proposals!.find(({ address: proposalAddress }) => proposalAddress === address)!.name!,
      userAllocations,
    });
    if (newIds) {
      setAllocations(newIds);
    }
  };

  return { onAddRemoveFromAllocate };
}
