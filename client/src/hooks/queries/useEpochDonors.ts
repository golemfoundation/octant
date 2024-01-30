import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetEpochDonations, Response } from 'api/calls/epochDonations';
import { QUERY_KEYS } from 'api/queryKeys';

type EpochDonor = {
  amount: BigNumber;
  user: string;
};

type EpochDonors = EpochDonor[];

export default function useEpochDonors(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, EpochDonors, any>,
): UseQueryResult<EpochDonors> {
  return useQuery(QUERY_KEYS.epochDonors(epoch), () => apiGetEpochDonations(epoch), {
    select: response => {
      return response.reduce((acc, curr) => {
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
      }, [] as EpochDonors);
    },
    ...options,
  });
}
