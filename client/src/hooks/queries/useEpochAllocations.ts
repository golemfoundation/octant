import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochAllocations, Response } from 'api/calls/epochAllocations';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type EpochAllocation = {
  amount: bigint;
  user: string;
};

type EpochAllocations = EpochAllocation[];

export default function useEpochAllocations(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, EpochAllocations, any>,
): UseQueryResult<EpochAllocations, unknown> {
  return useQuery({
    queryFn: ({ signal }) => apiGetEpochAllocations(epoch, signal),
    queryKey: QUERY_KEYS.epochAllocations(epoch),
    select: response => {
      return response.allocations.reduce((acc, curr) => {
        const donorIdx = acc.findIndex(({ user }) => user === curr.donor);

        if (donorIdx > -1) {
          // eslint-disable-next-line operator-assignment
          acc[donorIdx].amount = acc[donorIdx].amount + parseUnitsBigInt(curr.amount, 'wei');
        } else {
          acc.push({
            amount: parseUnitsBigInt(curr.amount, 'wei'),
            user: curr.donor,
          });
        }

        return acc;
      }, [] as EpochAllocations);
    },
    ...options,
  });
}
