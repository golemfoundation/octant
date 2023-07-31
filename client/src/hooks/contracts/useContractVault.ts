import { useMemo } from 'react';

import env from 'env';

import Vault from './abi/Vault.json';
import { ContractContext as VaultContract } from './typings/Vault';
import { web3 } from './web3';

export default function useContractEpochs(): VaultContract {
  return useMemo(() => {
    return new web3.eth.Contract<typeof Vault.abi>(
      Vault.abi,
      env.contractGlmAddress,
    ) as unknown as VaultContract;
  }, []);
}
