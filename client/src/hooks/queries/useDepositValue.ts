import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractDeposits from 'hooks/contracts/useContractDeposits';

export default function useDepositValue(): UseQueryResult<BigNumber> {
  const {
    metaState: { web3, account },
  } = useMetamask();
  const signer = web3?.getSigner();
  const address = account[0];
  const contractDeposits = useContractDeposits({ signerOrProvider: signer });

  return useQuery(['depositsValue'], () => contractDeposits?.deposits(address), {
    enabled: !!contractDeposits && !!address,
  });
}
