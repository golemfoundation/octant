import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractProposals } from 'hooks/contracts/readContracts';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useProposalsContract(epoch?: number): UseQueryResult<string[], unknown> {
  // TODO OCT-1270 TODO OCT-1312 Remove this override.
  const epochOverrideForDataFetch = epoch === 2 ? 3 : epoch;

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const publicClient = usePublicClient();

  const query = useQuery({
    enabled:
      epochOverrideForDataFetch !== undefined ||
      (!!currentEpoch && ((isDecisionWindowOpen && currentEpoch > 0) || !isDecisionWindowOpen)),

    // When decision window is open, fetch proposals from the previous epoch, because that's what users should be allocating to.
    queryFn: () =>
      readContractProposals({
        args: epochOverrideForDataFetch
          ? [epochOverrideForDataFetch]
          : [isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!],
        functionName: 'getProposalAddresses',
        publicClient,
      }),
    queryKey:
      epochOverrideForDataFetch || currentEpoch
        ? QUERY_KEYS.proposalsContract(
            epochOverrideForDataFetch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
          )
        : [''],
  });

  useEffect(() => {
    if (!query.error) {
      return;
    }
    throw new Error(JSON.stringify(query.error));
  }, [query.error]);

  return query;
}
