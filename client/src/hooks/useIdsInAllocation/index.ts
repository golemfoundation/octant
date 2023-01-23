import { useDispatch } from 'react-redux';

import { ExtendedProposal } from 'types/proposals';
import { allocationsSet } from 'store/models/allocations/actions';
import { onAddRemoveAllocationElementLocalStorage } from 'hooks/utils';
import useUserAllocations from 'hooks/useUserAllocations';

export default function useIdsInAllocation({
  allocations,
  proposals,
  proposalName,
}: {
  allocations: number[];
  proposalName?: string;
  proposals?: ExtendedProposal[];
}): { onAddRemoveFromAllocate: (id: number) => void } {
  const { data: userAllocations } = useUserAllocations();
  const dispatch = useDispatch();

  const onAddRemoveFromAllocate = (id: number) => {
    const newIds = onAddRemoveAllocationElementLocalStorage({
      allocations,
      id,
      name:
        proposalName || proposals!.find(({ id: proposalId }) => proposalId.toNumber() === id)!.name,
      userAllocations,
    });
    if (newIds) {
      dispatch(allocationsSet(newIds));
    }
  };

  return { onAddRemoveFromAllocate };
}
