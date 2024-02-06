import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetSyncStatus, Response as ApiResponse } from 'api/calls/syncStatus';
import { QUERY_KEYS } from 'api/queryKeys';

export type Response = {
  finalizedSnapshot: ApiResponse['finalizedSnapshot'];
  pendingSnapshot: ApiResponse['pendingSnapshot'];
};

export default function useSyncStatus(
  options?: Omit<UseQueryOptions<Response, unknown, Response, any>, 'queryKey'>,
): UseQueryResult<Response, unknown> {
  return useQuery({
    queryFn: () => apiGetSyncStatus(),
    queryKey: QUERY_KEYS.syncStatus,
    /**
     * We compare only finalizedSnapshot & pendingSnapshot values.
     * Watching for the rest of them, indexed blocks, causes flickering in the App.tsx
     * and multiple reloads.
     */
    select: response => ({
      finalizedSnapshot: response.finalizedSnapshot,
      pendingSnapshot: response.pendingSnapshot,
    }),
    ...options,
  });
}
