import { useDispatch } from 'react-redux';

import useUserAllocations from 'hooks/queries/useUserAllocations';
import { allocationsSet } from 'store/models/allocations/actions';
import { AllocationsStore } from 'store/models/allocations/types';
import { ExtendedProposal } from 'types/proposals';

import { onAddRemoveAllocationElementLocalStorage } from './utils';

export default function useIdsInAllocation({
  allocations,
  proposals,
  proposalName,
}: {
  allocations: NonNullable<AllocationsStore>;
  proposalName?: string;
  proposals?: ExtendedProposal[];
}): { onAddRemoveFromAllocate: (address: string) => void } {
  const { data: userAllocations } = useUserAllocations();
  const dispatch = useDispatch();

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
      dispatch(allocationsSet(newIds));
    }
  };

  return { onAddRemoveFromAllocate };
}
