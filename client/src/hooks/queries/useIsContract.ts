import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetGnosisSafeAccountDetails } from 'api/calls/multisig';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useIsContract(): UseQueryResult<boolean> {
  const { address } = useAccount();

  const query = useQuery({
    enabled: !!address,
    queryFn: () => apiGetGnosisSafeAccountDetails(address!),
    queryKey: QUERY_KEYS.isContract(address!),
    retry: false,
    retryOnMount: false,
  });

  // @ts-expect-error It does not understand mapping of the response to boolean here.
  return {
    ...query,
    data: !query.isFetching ? !query.isError : undefined,
  };
}
