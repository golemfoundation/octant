import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
/* eslint-enable import/no-unresolved */

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetLockedSummaryLatestQuery } from 'gql/graphql';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type LockedSummaryLatest = {
  id: string;
  lockedRatio: string;
  // Comes from Subraph in WEI, we are parsing it to bigint.
  lockedTotal: bigint;
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
        lockedTotal: parseUnitsBigInt(data.lockedSummaryLatest.lockedTotal, 'wei'),
      };
    },
  });
}
