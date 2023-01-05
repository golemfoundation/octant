import { useDispatch } from 'react-redux';

import { ExtendedProposal } from 'types/proposals';
import { allocationsAdd } from 'store/models/allocations/actions';
import { onAddRemoveAllocationElementLocalStorage } from 'hooks/utils';
import useUserVote from 'hooks/useUserVote';

export default function useIdsInAllocation({
  allocations,
  proposals,
  proposalName,
}: {
  allocations: number[];
  proposalName?: string;
  proposals?: ExtendedProposal[];
}): { onAddRemoveFromAllocate: (id: number) => void } {
  const { data: userVote } = useUserVote();
  const dispatch = useDispatch();

  const onAddRemoveFromAllocate = (id: number) => {
    const newIds = onAddRemoveAllocationElementLocalStorage({
      allocations,
      id,
      name:
        proposalName || proposals!.find(({ id: proposalId }) => proposalId.toNumber() === id)!.name,
      userVote,
    });
    if (newIds) {
      dispatch(allocationsAdd(newIds));
    }
  };

  return { onAddRemoveFromAllocate };
}
