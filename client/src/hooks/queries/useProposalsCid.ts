import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractProposals } from 'hooks/contracts/readContracts';

export default function useProposalsCid(): UseQueryResult<string> {
  const publicClient = usePublicClient();

  return useQuery(
    QUERY_KEYS.proposalsCid,
    () => readContractProposals({ functionName: 'cid', publicClient }),
    {},
  );
}
