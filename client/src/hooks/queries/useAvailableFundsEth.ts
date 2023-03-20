import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useWallet from 'store/models/wallet/store';

export default function useAvailableFundsEth(): UseQueryResult<BigNumber> {
  const {
    wallet: { web3, address },
  } = useWallet();

  return useQuery(QUERY_KEYS.availableFundsEth, () => web3?.getBalance(address), {
    enabled: !!web3 && !!address,
  });
}
