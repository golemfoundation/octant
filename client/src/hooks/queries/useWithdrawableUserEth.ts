import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractPayouts from 'hooks/contracts/useContractPayouts';
import useWallet from 'store/models/wallet/store';

export default function useWithdrawableUserEth(): UseQueryResult<BigNumber> {
  const contractPayouts = useContractPayouts();
  const {
    wallet: { address },
  } = useWallet();

  return useQuery(
    QUERY_KEYS.withdrawableUserEth,
    () => contractPayouts?.withdrawableUserETH(address!),
    {
      enabled: !!contractPayouts && !!address,
    },
  );
}
