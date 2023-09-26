import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetSyncStatus, Response } from 'api/calls/syncStatus';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useSyncStatus(
  options?: UseQueryOptions<Response, unknown, Response, any>,
): UseQueryResult<Response> {
  return useQuery(QUERY_KEYS.syncStatus, () => apiGetSyncStatus(), {
    ...options,
  });
}
