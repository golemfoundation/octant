import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractProposals } from 'hooks/contracts/readContracts';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useProposalsContract(epoch?: number): UseQueryResult<string[]> {
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const publicClient = usePublicClient();

  return useQuery(
    epoch || currentEpoch
      ? QUERY_KEYS.proposalsContract(
          (epoch && epoch - 1) || isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!,
        )
      : [''],
    // When decision window is open, fetch proposals from the previous epoch, because that's what users should be allocating to.
    () =>
      readContractProposals({
        args: epoch ? [epoch] : [isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!],
        functionName: 'getProposalAddresses',
        publicClient,
      }),
    {
      enabled:
        epoch !== undefined ||
        (!!currentEpoch && ((isDecisionWindowOpen && currentEpoch > 0) || !isDecisionWindowOpen)),
      onError: error => {
        throw new Error(JSON.stringify(error));
      },
    },
  );
}
