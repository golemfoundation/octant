import { BigNumber } from 'ethers';
import { useQuery, UseQueryResult } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractTracker from 'hooks/contracts/useContractTracker';

import useCurrentEpoch from './useCurrentEpoch';

export default function useDepositEffectiveAtCurrentEpoch(): UseQueryResult<BigNumber | undefined> {
  const {
    metaState: { web3, account },
  } = useMetamask();
  const signer = web3?.getSigner();
  const address = account[0];
  const contractTracker = useContractTracker({ signerOrProvider: signer });
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    ['depositAt', currentEpoch],
    () => contractTracker?.depositAt(address, currentEpoch!),
    {
      enabled: !!contractTracker && !!currentEpoch && !!address,
    },
  );
}
