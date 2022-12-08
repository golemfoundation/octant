import { BigNumberish } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import env from 'env';

import useDepositsContract from './contracts/useDepositsContract';

export default function useDepositValue(): UseQueryResult<BigNumberish> {
  const {
    metaState: { web3, account },
  } = useMetamask();
  const address = account[0];
  const { depositsAddress } = env;
  const signer = web3?.getSigner();
  const contractDeposits = useDepositsContract(depositsAddress, signer);

  return useQuery(['depositsValue'], () => contractDeposits?.deposits(address), {
    enabled: !!contractDeposits && !!address,
  });
}
