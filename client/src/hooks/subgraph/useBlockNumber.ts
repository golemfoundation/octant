import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';

type Test = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _meta?:
    | {
        block: {
          number: number;
        };
      }
    | undefined
    | null;
};

const GET_BLOCK_NUMBER = graphql(`
  query GetBlockNumber {
    _meta {
      block {
        number
      }
    }
  }
`);

export default function useBlockNumber(
  isRefetchEnabled = true,
): UseQueryResult<number | null | undefined> {
  const { subgraphAddress } = env;

  return useQuery<Test, any, number | undefined, any>(
    QUERY_KEYS.blockNumber,
    async () => request(subgraphAddress, GET_BLOCK_NUMBER),
    {
      refetchInterval: isRefetchEnabled ? 1000 : false,
      select: data => data._meta?.block.number,
    },
  );
}
