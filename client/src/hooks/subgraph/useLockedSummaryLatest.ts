import { useQuery, UseQueryResult } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetLockedSummaryLatestQuery } from 'gql/graphql';

type LockedSummaryLatest = {
  id: string;
  lockedRatio: string;
  // Comes from Subraph in WEI, we are parsing it to BigNumber.
  lockedTotal: BigNumber;
};

const GET_LOCKED_SUMMARY_LATEST = graphql(`
  query GetLockedSummaryLatest {
    lockedSummaryLatest(id: "latest") {
      id
      lockedTotal
      lockedRatio
    }
  }
`);

export default function useLockedSummaryLatest(): UseQueryResult<
  LockedSummaryLatest | null | undefined
> {
  const { subgraphAddress } = env;

  return useQuery<GetLockedSummaryLatestQuery, any, LockedSummaryLatest | null, any>({
    queryFn: async () => request(subgraphAddress, GET_LOCKED_SUMMARY_LATEST),
    queryKey: QUERY_KEYS.lockedSummaryLatest,
    refetchOnMount: false,
    select: data => {
      if (!data.lockedSummaryLatest) {
        return null;
      }
      return {
        id: data!.lockedSummaryLatest.id,
        lockedRatio: data!.lockedSummaryLatest.lockedRatio,
        lockedTotal: parseUnits(data.lockedSummaryLatest.lockedTotal, 'wei'),
      };
    },
  });
}
