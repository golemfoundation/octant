import { useQuery, UseQueryResult } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';

type LockedSummaryLatest = {
  id: string;
  lockedRatio: string;
  lockedTotal: string;
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

  return useQuery(
    QUERY_KEYS.locks,
    async () => request(subgraphAddress, GET_LOCKED_SUMMARY_LATEST),
    {
      // @ts-expect-error Requests to subgraph are disabled in Cypress before transition to the server is done.
      enabled: window.Cypress === undefined,
      refetchOnMount: false,
      select: data => data.lockedSummaryLatest,
    },
  );
}
