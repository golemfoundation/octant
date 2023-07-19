import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';

// TODO OCT-624 Remove this hook. Empty hook left for UI so it doesn't break.
export default function useUserAllocations(): UseQueryResult<any[]> {
  const { address } = useAccount();

  return useQuery(QUERY_KEYS.userHistoricAllocations(address!), async () => {}, {
    // @ts-expect-error Requests to subgraph are disabled in Cypress before transition to the server is done.
    enabled: !!address && window.Cypress === undefined,
    refetchOnMount: false,
  });
}
