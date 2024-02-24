import { useQueries, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { apiGetEpochPatrons, Response } from 'api/calls/epochPatrons';
import { QUERY_KEYS } from 'api/queryKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

export default function useEpochPatronsAllEpochs(
  options?: Omit<UseQueryOptions<Response, Error, Response, any>, 'queryKey'>,
): { data: string[][]; isFetching: boolean } {
  const { data: currentEpoch, isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();

  const epochPatronsAllEpochs: UseQueryResult<Response>[] = useQueries({
    queries: [...Array(currentEpoch).keys()].map(epoch => ({
      enabled: currentEpoch !== undefined && currentEpoch > 1,
      queryFn: async () => {
        try {
          return await apiGetEpochPatrons(epoch);
        } catch (error) {
          // For epoch 0 BE returns an error.
          return new Promise<Response>(resolve => {
            resolve({ patrons: [] });
          });
        }
      },
      queryKey: QUERY_KEYS.epochPatrons(epoch),
      retry: false,
      ...options,
    })),
  });

  const isFetchingEpochPatronsAllEpochs =
    isFetchingCurrentEpoch ||
    epochPatronsAllEpochs.length === 0 ||
    epochPatronsAllEpochs.some(({ isFetching }) => isFetching);

  if (isFetchingEpochPatronsAllEpochs) {
    return {
      data: [],
      isFetching: isFetchingEpochPatronsAllEpochs,
    };
  }

  return {
    data: epochPatronsAllEpochs.map(({ data }) =>
      // For epoch 0 endpoint returns an error.
      data ? data.patrons : [],
    ),
    isFetching: false,
  };
}
