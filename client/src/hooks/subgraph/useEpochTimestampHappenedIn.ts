import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
/* eslint-enable import/no-unresolved */

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetEpochTimestampHappenedInQuery } from 'gql/graphql';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

const GET_EPOCH_TIMESTAMP_HAPPENED_IN = graphql(`
  query GetEpochTimestampHappenedIn($timestamp: BigInt) {
    epoches(where: { fromTs_lte: $timestamp, toTs_gte: $timestamp }) {
      epoch
    }
  }
`);

export default function useEpochTimestampHappenedIn(
  timestampSeconds: string,
): UseQueryResult<number> {
  const { subgraphAddress } = env;
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const timestampSecondsNumber = parseInt(timestampSeconds, 10);

  // workaround for Cypress to return currentEpoch instead of epoch based on timestamp for testing TransactionDetails
  return useQuery<GetEpochTimestampHappenedInQuery, any, number, any>({
    enabled: window.Cypress
      ? currentEpoch !== undefined && isDecisionWindowOpen !== undefined
      : !!timestampSecondsNumber,
    queryFn: async () =>
      request(subgraphAddress, GET_EPOCH_TIMESTAMP_HAPPENED_IN, {
        timestamp: timestampSecondsNumber,
      }),
    queryKey: QUERY_KEYS.epochTimestampHappenedIn(timestampSecondsNumber),
    select: data => {
      if (window.Cypress) {
        return currentEpoch!;
      }
      return data.epoches[0].epoch;
    },
  });
}
