import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractDeposits from 'hooks/contracts/useContractDeposits';
import useWallet from 'store/models/wallet/store';

export default function useDepositValue(): UseQueryResult<BigNumber> {
  const {
    wallet: { web3, address },
  } = useWallet();
  const signer = web3?.getSigner();
  const contractDeposits = useContractDeposits({ signerOrProvider: signer });

  return useQuery(QUERY_KEYS.depositsValue, () => contractDeposits?.deposits(address!), {
    enabled: !!contractDeposits && !!address,
  });
}
