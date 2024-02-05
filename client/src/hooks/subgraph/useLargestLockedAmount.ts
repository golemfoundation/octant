import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetLargestLockedAmountQuery } from 'gql/graphql';

const GET_LARGEST_LOCKED_AMOUNT = graphql(`
  query GetLargestLockedAmount {
    lockeds(orderBy: amount, orderDirection: desc, first: 1) {
      amount
    }
  }
`);

export default function useLargestLockedAmount(): UseQueryResult<BigNumber> {
  const { subgraphAddress } = env;

  return useQuery<GetLargestLockedAmountQuery, any, BigNumber, any>(
    QUERY_KEYS.largestLockedAmount,
    async () => request(subgraphAddress, GET_LARGEST_LOCKED_AMOUNT),
    {
      refetchOnMount: false,
      select: data => {
        if (!data?.lockeds?.length) {
          return BigNumber.from(0);
        }
        return parseUnits(data.lockeds[0].amount, 'wei');
      },
    },
  );
}
