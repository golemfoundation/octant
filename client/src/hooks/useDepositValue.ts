import { BigNumberish } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractDeposits from './contracts/useContractDeposits';

export default function useDepositValue(): UseQueryResult<BigNumberish> {
  const {
    metaState: { web3, account },
  } = useMetamask();
  const address = account[0];
  const signer = web3?.getSigner();
  const contractDeposits = useContractDeposits({ signerOrProvider: signer });

  return useQuery(['depositsValue'], () => contractDeposits?.deposits(address), {
    enabled: !!contractDeposits && !!address,
  });
}
