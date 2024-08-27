import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochAllocations, Response } from 'api/calls/epochAllocations';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type EpochAllocation = {
  amount: bigint;
  donor: string;
  project: string;
};

type EpochAllocations = EpochAllocation[];

export default function useEpochAllocations(
  epoch: number,
  options?: Omit<UseQueryOptions<Response, unknown, EpochAllocations, any>, 'queryKey'>,
): UseQueryResult<EpochAllocations, unknown> {
  return useQuery({
    queryFn: ({ signal }) => apiGetEpochAllocations(epoch, signal),
    queryKey: QUERY_KEYS.epochAllocations(epoch),
    select: response => {
      return response.allocations.reduce((acc, curr) => {
        acc.push({
          ...curr,
          amount: parseUnitsBigInt(curr.amount, 'wei'),
        });

        return acc;
      }, [] as EpochAllocations);
    },
    ...options,
  });
}
