import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';

type Meta = {
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

  return useQuery<Meta, any, number | undefined, any>({
    queryFn: async () => request(subgraphAddress, GET_BLOCK_NUMBER),
    queryKey: QUERY_KEYS.blockNumber,
    refetchInterval: isRefetchEnabled ? 1000 : false,
    select: data => data._meta?.block.number,
  });
}
