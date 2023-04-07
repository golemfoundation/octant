import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useSigner, useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractTracker from 'hooks/contracts/useContractTracker';

import useCurrentEpoch from './useCurrentEpoch';

export default function useDepositEffectiveAtCurrentEpoch(): UseQueryResult<BigNumber | undefined> {
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const contractTracker = useContractTracker({ signerOrProvider: signer });
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    currentEpoch ? QUERY_KEYS.depositAtGivenEpoch(currentEpoch) : [''],
    () => contractTracker?.depositAt(address!, currentEpoch!),
    {
      enabled: !!contractTracker && !!currentEpoch && !!address,
    },
  );
}
