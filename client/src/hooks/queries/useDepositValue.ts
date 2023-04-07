import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useAccount, useSigner } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractDeposits from 'hooks/contracts/useContractDeposits';

export default function useDepositValue(): UseQueryResult<BigNumber> {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const contractDeposits = useContractDeposits({ signerOrProvider: signer });

  return useQuery(QUERY_KEYS.depositsValue, () => contractDeposits?.deposits(address!), {
    enabled: !!contractDeposits && !!address,
  });
}
