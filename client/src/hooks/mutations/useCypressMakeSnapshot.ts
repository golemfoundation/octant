import { useMutation, UseMutationResult } from '@tanstack/react-query';

import { apiPostSnapshotsPending, apiPostSnapshotsFinalized } from 'api/calls/snapshots';

export default function useCypressMakeSnapshot(): UseMutationResult<undefined, any, 'pending' | 'finalized'> {
  return useMutation({
    mutationFn: (type: 'pending' | 'finalized') => type === 'pending'
      ? apiPostSnapshotsPending()
      : apiPostSnapshotsFinalized(),
  })
}
