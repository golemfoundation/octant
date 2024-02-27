import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetLargestLockedAmountQuery } from 'gql/graphql';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

const GET_LARGEST_LOCKED_AMOUNT = graphql(`
  query GetLargestLockedAmount {
    lockeds(orderBy: amount, orderDirection: desc, first: 1) {
      amount
    }
  }
`);

export default function useLargestLockedAmount(): UseQueryResult<bigint> {
  const { subgraphAddress } = env;

  return useQuery<GetLargestLockedAmountQuery, any, bigint, any>({
    queryFn: async () => request(subgraphAddress, GET_LARGEST_LOCKED_AMOUNT),
    queryKey: QUERY_KEYS.largestLockedAmount,
    refetchOnMount: false,
    select: data => {
      if (!data?.lockeds?.length) {
        return BigInt(0);
      }
      return parseUnitsBigInt(data.lockeds[0].amount, 'wei');
    },
  });
}
