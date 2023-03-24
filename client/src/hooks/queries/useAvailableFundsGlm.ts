import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { useAccount, useSigner } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractErc20 from 'hooks/contracts/useContractErc20';

export default function useAvailableFundsGlm(): UseQueryResult<BigNumber> {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const erc20Contract = useContractErc20({ signerOrProvider: signer });

  return useQuery(QUERY_KEYS.availableFundsGlm, () => erc20Contract?.balanceOf(address!), {
    enabled: !!erc20Contract && !!address,
  });
}
