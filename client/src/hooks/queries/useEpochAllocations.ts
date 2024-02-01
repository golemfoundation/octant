import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetEpochAllocations, Response } from 'api/calls/epochAllocations';
import { QUERY_KEYS } from 'api/queryKeys';

type EpochAllocation = {
  amount: BigNumber;
  user: string;
};

type EpochAllocations = EpochAllocation[];

export default function useEpochAllocations(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, EpochAllocations, any>,
): UseQueryResult<EpochAllocations> {
  return useQuery(QUERY_KEYS.epochAllocations(epoch), () => apiGetEpochAllocations(epoch), {
    select: response => {
      return response.allocations.reduce((acc, curr) => {
        const donorIdx = acc.findIndex(({ user }) => user === curr.donor);

        if (donorIdx > -1) {
          acc[donorIdx].amount = acc[donorIdx].amount.add(parseUnits(curr.amount, 'wei'));
        } else {
          acc.push({
            amount: parseUnits(curr.amount, 'wei'),
            user: curr.donor,
          });
        }

        return acc;
      }, [] as EpochAllocations);
    },
    ...options,
  });
}
