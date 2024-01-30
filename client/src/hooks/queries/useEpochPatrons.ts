import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochPatrons, Response } from 'api/calls/epochPatrons';
import { QUERY_KEYS } from 'api/queryKeys';

type UseEpochPatrons = string[];

export default function useEpochPatrons(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, UseEpochPatrons, any>,
): UseQueryResult<UseEpochPatrons> {
  return useQuery(QUERY_KEYS.epochPatrons(epoch), () => apiGetEpochPatrons(epoch), {
    select: response => response.patrons,
    ...options,
  });
}
