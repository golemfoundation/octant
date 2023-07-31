import { useMemo } from 'react';

import env from 'env';

import Deposits from './abi/Deposits.json';
import { ContractContext as DepositsContract } from './typings/Deposits';
import { web3 } from './web3';

export default function useContractDeposits(): DepositsContract {
  return useMemo(() => {
    return new web3.eth.Contract<typeof Deposits.abi>(
      Deposits.abi,
      env.contractDepositsAddress,
    ) as unknown as DepositsContract;
  }, []);
}
