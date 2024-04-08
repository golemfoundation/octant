import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';

export default function useIsContract(
  options?: UseQueryOptions<undefined | string, unknown, boolean | undefined, any>,
): UseQueryResult<boolean | undefined, unknown> {
  const { address } = useAccount();
  const { getBytecode } = usePublicClient();

  return useQuery({
    enabled: !!address,
    queryFn: () =>
      getBytecode({ address: address! }).then(data => {
        if (!data) {return '';}
        return data;
      }),
    queryKey: QUERY_KEYS.bytecode(address!),
    select: response => !!response,
    ...options,
  });
}
