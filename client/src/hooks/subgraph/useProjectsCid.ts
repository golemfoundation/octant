import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
/* eslint-enable import/no-unresolved */
import _last from 'lodash/last';

import { QUERY_KEYS } from 'api/queryKeys';
import { QueryKeys } from 'api/queryKeys/types';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetProjectsMetadataPerEpochesQuery } from 'gql/graphql';

type QueryData = string | null | undefined;

const GET_PROJECTS_METADATA_PER_EPOCHES = graphql(`
  query GetProjectsMetadataPerEpoches {
    projectsMetadataPerEpoches(orderBy: epoch, orderDirection: asc) {
      epoch
      proposalsCid
    }
  }
`);

export default function useProjectsCid(
  epoch: number,
  options?: Omit<
    UseQueryOptions<
      GetProjectsMetadataPerEpochesQuery,
      unknown,
      QueryData,
      QueryKeys['projectsMetadataPerEpoches']
    >,
    'queryKey'
  >,
): UseQueryResult<QueryData> {
  const { subgraphAddress } = env;

  return useQuery<
    GetProjectsMetadataPerEpochesQuery,
    any,
    QueryData,
    QueryKeys['projectsMetadataPerEpoches']
  >({
    queryFn: async () => request(subgraphAddress, GET_PROJECTS_METADATA_PER_EPOCHES),
    queryKey: QUERY_KEYS.projectsMetadataPerEpoches,
    select: data => {
      // Returns proposalsCid for the current or previous (lower, nearest) epoch
      const epochProjectsCid = _last(
        data.projectsMetadataPerEpoches.filter(p => p.epoch <= epoch),
      )?.proposalsCid;

      return epochProjectsCid;
    },
    ...options,
  });
}
