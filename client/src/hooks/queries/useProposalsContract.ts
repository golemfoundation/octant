import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractProposals } from 'hooks/contracts/readContracts';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useProposalsContract(): UseQueryResult<string[]> {
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const publicClient = usePublicClient();

  return useQuery(
    QUERY_KEYS.proposalsContract,
    // When decision window is open, fetch proposals from the previous epoch, because that's what users should be allocating to.
    () =>
      readContractProposals({
        args: [isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!],
        functionName: 'getProposalAddresses',
        publicClient,
      }),
    {
      enabled:
        !!currentEpoch && ((isDecisionWindowOpen && currentEpoch > 0) || !isDecisionWindowOpen),
      onError: error => {
        throw new Error(JSON.stringify(error));
      },
    },
  );
}
