import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useAccount, useSigner } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';

export default function useAvailableFundsEth(): UseQueryResult<BigNumber> {
  const { data: signer } = useSigner();
  const { address } = useAccount();

  return useQuery(QUERY_KEYS.availableFundsEth, () => signer?.provider?.getBalance(address!), {
    enabled: !!signer && !!address,
  });
}
