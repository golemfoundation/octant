import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractProposals from 'hooks/contracts/useContractProposals';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useProposalsContract(): UseQueryResult<string[]> {
  const contractProposals = useContractProposals();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.proposalsContract,
    // When decision window is open, fetch proposals from the previous epoch, because that's what users should be allocating to.
    () =>
      contractProposals?.getProposalAddresses(
        isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!,
      ),
    {
      enabled:
        !!contractProposals &&
        !!currentEpoch &&
        ((isDecisionWindowOpen && currentEpoch > 0) || !isDecisionWindowOpen),
    },
  );
}
