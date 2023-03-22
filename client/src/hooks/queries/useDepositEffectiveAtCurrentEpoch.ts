import { BigNumber } from 'ethers';
import { useQuery, UseQueryResult } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractTracker from 'hooks/contracts/useContractTracker';
import useWallet from 'store/models/wallet/store';

import useCurrentEpoch from './useCurrentEpoch';

export default function useDepositEffectiveAtCurrentEpoch(): UseQueryResult<BigNumber | undefined> {
  const {
    wallet: { web3, address },
  } = useWallet();
  const signer = web3?.getSigner();
  const contractTracker = useContractTracker({ signerOrProvider: signer });
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    currentEpoch ? QUERY_KEYS.depositAtGivenEpoch(currentEpoch) : '',
    () => contractTracker?.depositAt(address!, currentEpoch!),
    {
      enabled: !!contractTracker && !!currentEpoch && !!address,
    },
  );
}
