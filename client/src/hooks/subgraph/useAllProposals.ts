import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import { QueryKeys } from 'api/queryKeys/types';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetProjectsMetadataAccumulatedsQuery } from 'gql/graphql';

const GET_PROJECTS_METADATA_ACCUMULATEDS = graphql(`
  query GetProjectsMetadataAccumulateds {
    projectsMetadataAccumulateds {
      projectsAddresses
    }
  }
`);

export default function useAllProposals(): UseQueryResult<string[] | null | undefined> {
  const { subgraphAddress } = env;

  return useQuery<
    GetProjectsMetadataAccumulatedsQuery,
    any,
    string[] | null | undefined,
    QueryKeys['projectsMetadataAccumulateds']
  >(
    QUERY_KEYS.projectsMetadataAccumulateds,
    async () => request(subgraphAddress, GET_PROJECTS_METADATA_ACCUMULATEDS),
    {
      select: data =>
        data?.projectsMetadataAccumulateds.reduce<string[]>(
          (acc, curr) => [...new Set(acc.concat(curr.projectsAddresses))],
          [],
        ),
    },
  );
}
