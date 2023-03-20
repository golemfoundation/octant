import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractErc20 from 'hooks/contracts/useContractErc20';
import useWallet from 'store/models/wallet/store';

export default function useAvailableFundsGlm(): UseQueryResult<BigNumber> {
  const {
    wallet: { address, web3 },
  } = useWallet();
  const signer = web3?.getSigner();
  const erc20Contract = useContractErc20({ signerOrProvider: signer });

  return useQuery(QUERY_KEYS.availableFundsGlm, () => erc20Contract?.balanceOf(address!), {
    enabled: !!erc20Contract && !!address,
  });
}
