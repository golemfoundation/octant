import { BigNumberish, Signer } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractErc20 from 'hooks/contracts/useContractErc20';

export default function useAvailableFunds(address: string, signer: Signer): UseQueryResult<number> {
  const erc20Contract = useContractErc20({ signerOrProvider: signer });

  return useQuery<BigNumberish | undefined, unknown, number>(
    QUERY_KEYS.currentBalance,
    () => erc20Contract?.balanceOf(address),
    {
      enabled: !!erc20Contract && !!address,
    },
  );
}
