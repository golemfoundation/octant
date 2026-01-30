import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import networkConfig from 'constants/networkConfig';
import { readContractRegenStaker } from 'hooks/contracts/readContracts';

export default function useRegenStakerMinimumStakeAmount(): UseQueryResult<bigint> {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: networkConfig.id });

  return useQuery({
    enabled: !!address,
    queryFn: () =>
      readContractRegenStaker({
        functionName: 'minimumStakeAmount',
        publicClient,
      }),
    queryKey: QUERY_KEYS.regenStakerMinimumStakeAmount,
    select: response => BigInt(response),
  });
}
