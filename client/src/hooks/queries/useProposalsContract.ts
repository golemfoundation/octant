import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractProposals } from 'hooks/contracts/readContracts';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useProposalsContract(epoch?: number): UseQueryResult<string[]> {
  // TODO OCT-1270 TODO OCT-1312 Remove this override.
  const epochOverrideForDataFetch = epoch === 2 ? 3 : epoch;

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const publicClient = usePublicClient();

  return useQuery(
    epochOverrideForDataFetch || currentEpoch
      ? QUERY_KEYS.proposalsContract(
          epochOverrideForDataFetch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
        )
      : [''],
    // When decision window is open, fetch proposals from the previous epoch, because that's what users should be allocating to.
    () =>
      readContractProposals({
        args: epochOverrideForDataFetch
          ? [epochOverrideForDataFetch]
          : [isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!],
        functionName: 'getProposalAddresses',
        publicClient,
      }),
    {
      enabled:
        epochOverrideForDataFetch !== undefined ||
        (!!currentEpoch && ((isDecisionWindowOpen && currentEpoch > 0) || !isDecisionWindowOpen)),
      onError: error => {
        throw new Error(JSON.stringify(error));
      },
    },
  );
}
