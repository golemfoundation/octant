import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractPayouts from 'hooks/contracts/useContractPayouts';

export default function useWithdrawableUserEth(): UseQueryResult<BigNumber> {
  const { address } = useAccount();
  const contractPayouts = useContractPayouts();

  return useQuery(
    QUERY_KEYS.withdrawableUserEth,
    () => contractPayouts?.withdrawableUserETH(address!),
    {
      enabled: !!contractPayouts && !!address,
    },
  );
}
