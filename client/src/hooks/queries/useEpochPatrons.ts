import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochPatrons, Response } from 'api/calls/epochPatrons';
import { QUERY_KEYS } from 'api/queryKeys';

type UseEpochPatrons = string[];

export default function useEpochPatrons(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, UseEpochPatrons, any>,
): UseQueryResult<UseEpochPatrons, unknown> {
  return useQuery({
    queryFn: ({ signal }) => apiGetEpochPatrons(epoch, signal),
    queryKey: QUERY_KEYS.epochPatrons(epoch),
    select: response => response.patrons,
    ...options,
  });
}
