import { useMemo } from 'react';

import env from 'env';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import Epochs from './abi/Epochs.json';
import { ContractContext as EpochsContract } from './typings/Epochs';
import web3 from './web3';

export default function useContractEpochs(): EpochsContract | null {
  const { data: currentEpoch } = useCurrentEpoch();
  return useMemo(() => {
    return currentEpoch && currentEpoch > 1
      ? (new web3.eth.Contract<typeof Epochs.abi>(
          Epochs.abi,
          env.contractEpochsAddress,
        ) as unknown as EpochsContract)
      : null;
  }, [currentEpoch]);
}
