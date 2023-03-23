import { useQueries, useQuery } from 'react-query';

import { apiGetProposal } from 'api/calls/proposals';
import { QUERY_KEYS } from 'api/queryKeys';
import useContractProposals from 'hooks/contracts/useContractProposals';
import { BackendProposal, ExtendedProposal } from 'types/proposals';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';
import useProposalsCid from './useProposalsCid';

// TODO: Remove this util in OCT-295.
const getEpochToFetchProposals = (isDecisionWindowOpen, currentEpoch) => {
  if (isDecisionWindowOpen) {
    return currentEpoch > 1 ? currentEpoch - 1 : currentEpoch;
  }
  return currentEpoch;
};

export default function useProposals(): {
  data: ExtendedProposal[];
  refetch: () => Promise<unknown>;
} {
  const contractProposals = useContractProposals();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: proposalsCid } = useProposalsCid();

  const proposalsContract = useQuery(
    QUERY_KEYS.proposalsContract,
    // When decision window is open, fetch proposals from the previous epoch, because that's what users should be allocating to.
    () =>
      contractProposals?.getProposalAddresses(
        // TODO: Replace this value in OCT-295.
        // isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!,
        getEpochToFetchProposals(isDecisionWindowOpen, currentEpoch),
      ),
    {
      enabled: !!contractProposals && !!currentEpoch,
      // TODO: Add this check in OCT-295.
      // && ((isDecisionWindowOpen && currentEpoch > 1) || !isDecisionWindowOpen),
    },
  );

  const proposalsIpfsResults = useQueries<BackendProposal[]>(
    (proposalsContract!.data || []).map(address => ({
      enabled: !!proposalsContract && !!proposalsContract.data && !!proposalsCid,
      queryFn: () => apiGetProposal(`${proposalsCid}/${address}`),
      queryKey: address ? QUERY_KEYS.proposalsIpfsResults(address) : '',
    })),
  );

  const isProposalsIpfsResultsLoading =
    proposalsIpfsResults.length === 0 || proposalsIpfsResults.some(({ isLoading }) => isLoading);

  if (isProposalsIpfsResultsLoading) {
    return {
      data: [],
      refetch: proposalsContract.refetch,
    };
  }

  return {
    data: proposalsIpfsResults.map<ExtendedProposal>((proposal, index) => ({
      address: proposalsContract!.data![index],
      isLoadingError: proposal.isError,
      ...(proposal.data || {}),
    })),
    refetch: proposalsContract.refetch,
  };
}
