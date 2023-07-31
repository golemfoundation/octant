import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractDeposits from 'hooks/contracts/useContractDeposits';

export default function useDepositValue(): UseQueryResult<BigNumber> {
  const { address } = useAccount();
  const contractDeposits = useContractDeposits();

  return useQuery(
    QUERY_KEYS.depositsValue,
    () => contractDeposits?.methods.deposits(address!).call(),
    {
      enabled: !!contractDeposits && !!address,
      select: response => BigNumber.from(response),
    },
  );
}
