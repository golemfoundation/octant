import { useMemo } from 'react';

import env from 'env';

import ERC20 from './abi/ERC20.json';
import { ContractContext as ERC20Contract } from './typings/ERC20';
import { web3 } from './web3';

export default function useContractEpochs(): ERC20Contract {
  return useMemo(() => {
    return new web3.eth.Contract<typeof ERC20.abi>(
      ERC20.abi,
      env.contractGlmAddress,
    ) as unknown as ERC20Contract;
  }, []);
}
