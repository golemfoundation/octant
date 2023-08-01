import { useMemo } from 'react';

import env from 'env';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import Vault from './abi/Vault.json';
import { ContractContext as VaultContract } from './typings/Vault';
import web3 from './web3';

export default function useContractVault(): VaultContract | null {
  const { data: currentEpoch } = useCurrentEpoch();
  return useMemo(() => {
    return currentEpoch && currentEpoch > 1
      ? (new web3.eth.Contract<typeof Vault.abi>(
          Vault.abi,
          env.contractVaultAddress,
        ) as unknown as VaultContract)
      : null;
  }, [currentEpoch]);
}
