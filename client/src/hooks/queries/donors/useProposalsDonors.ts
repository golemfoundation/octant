import { UseQueryResult, useQueries } from '@tanstack/react-query';

import { apiGetProposalDonors } from 'api/calls/poroposalDonors';
import { QUERY_KEYS } from 'api/queryKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsContract from 'hooks/queries/useProposalsContract';

import { ProposalDonor } from './types';
import { mapDataToProposalDonors } from './utils';

export default function useProposalsDonors(epoch?: number): {
  data: { [key: string]: ProposalDonor[] };
  isFetching: boolean;
} {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: proposalsAddresses } = useProposalsContract(epoch);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  // TODO OCT-1139 implement socket here.

  const proposalsDonorsResults: UseQueryResult<ProposalDonor[]>[] = useQueries({
    queries: (proposalsAddresses || []).map(proposalAddress => ({
      enabled: !!proposalsAddresses && isDecisionWindowOpen !== undefined,
      queryFn: () =>
        apiGetProposalDonors(
          proposalAddress,
          epoch || (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
        ),
      queryKey: QUERY_KEYS.proposalDonors(
        proposalAddress,
        epoch || (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
      ),
      select: response => mapDataToProposalDonors(response),
    })),
  });

  const isFetching =
    isDecisionWindowOpen === undefined ||
    proposalsAddresses === undefined ||
    proposalsDonorsResults.length === 0 ||
    proposalsDonorsResults.some(
      ({ isFetching: isFetchingProposalsDonorsResult }) => isFetchingProposalsDonorsResult,
    );
  if (isFetching) {
    return {
      data: {},
      isFetching,
    };
  }

  return {
    data: (proposalsDonorsResults || []).reduce((acc, curr, currentIndex) => {
      return {
        ...acc,
        [proposalsAddresses[currentIndex]]: curr.data,
      };
    }, {}),
    isFetching: false,
  };
}
