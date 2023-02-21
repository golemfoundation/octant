import { useQueries, useQuery } from 'react-query';

import { apiGetProposal } from 'api/proposals';
import useContractProposals from 'hooks/contracts/useContractProposals';
import { BackendProposal, ExtendedProposal } from 'types/proposals';

import useCurrentEpoch from './useCurrentEpoch';
import useProposalsCid from './useProposalsCid';

export default function useProposals(): ExtendedProposal[] {
  const contractProposals = useContractProposals();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: proposalsCid } = useProposalsCid();

  const proposalsContract = useQuery(
    ['proposalsContract'],
    () => contractProposals?.getProposalAddresses(currentEpoch!),
    {
      enabled: !!contractProposals && !!currentEpoch,
    },
  );

  const proposalsIpfsResults = useQueries<BackendProposal[]>(
    (proposalsContract!.data || []).map(address => ({
      enabled: !!proposalsContract && !!proposalsContract.data,
      queryFn: () => apiGetProposal(`${proposalsCid}/${address}`),
      queryKey: ['proposalsIpfsResults', address],
    })),
  );

  const isProposalsIpfsResultsLoading =
    proposalsIpfsResults.length === 0 || proposalsIpfsResults.some(({ isLoading }) => isLoading);

  if (isProposalsIpfsResultsLoading || !proposalsContract || !proposalsContract.data) {
    return [];
  }

  return proposalsIpfsResults.map<ExtendedProposal>((proposal, index) => ({
    address: proposalsContract!.data![index],
    isLoadingError: proposal.isError,
    ...(proposal.data || {}),
  }));
}
