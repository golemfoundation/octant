import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import networkConfig from 'constants/networkConfig';
import { readContractDeposits } from 'hooks/contracts/readContracts';

export default function useDepositValue(): UseQueryResult<bigint> {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: networkConfig.id });

  return useQuery({
    enabled: !!address,
    queryFn: () =>
      readContractDeposits({
        args: [address],
        functionName: 'deposits',
        publicClient,
      }),
    queryKey: QUERY_KEYS.depositsValue,
    select: response => BigInt(response),
  });
}
