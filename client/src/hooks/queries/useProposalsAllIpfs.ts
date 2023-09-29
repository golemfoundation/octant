import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetProposalsAll, Response } from 'api/calls/proposalsAll';
import { QUERY_KEYS } from 'api/queryKeys';
import useProposalsCid from 'hooks/queries/useProposalsCid';

export default function useProposalsAllIpfs(
  options?: UseQueryOptions<Response, unknown, string[], any>,
): UseQueryResult<string[]> {
  const { data: proposalsCid } = useProposalsCid();

  return useQuery(QUERY_KEYS.proposalsAllIpfs, () => apiGetProposalsAll(proposalsCid!), {
    enabled: !!proposalsCid,
    select: data => {
      return data.Objects.map(({ Links }) => {
        return Links.map(({ Name }) => Name);
      }).flat();
    },
    ...options,
  });
}
