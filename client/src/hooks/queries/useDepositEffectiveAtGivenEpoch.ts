import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractTracker from 'hooks/contracts/useContractTracker';

export default function useDepositEffectiveAtGivenEpoch(
  epochNumber?: number,
): UseQueryResult<BigNumber | undefined> {
  const {
    metaState: { web3, account },
  } = useMetamask();
  const signer = web3?.getSigner();
  const address = account[0];
  const contractTracker = useContractTracker({ signerOrProvider: signer });

  return useQuery(
    ['depositAt', epochNumber],
    () => contractTracker?.depositAt(address, epochNumber!),
    {
      enabled: !!contractTracker && !!epochNumber && !!address,
    },
  );
}
