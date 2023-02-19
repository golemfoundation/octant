import { useQueries, useQuery } from 'react-query';

import { apiGetProposal } from 'api/proposals';
import useContractProposals from 'hooks/contracts/useContractProposals';
import { BackendProposal, ExtendedProposal } from 'types/proposals';

import useCurrentEpoch from './useCurrentEpoch';

export default function useProposals(): ExtendedProposal[] {
  const contractProposals = useContractProposals();
  const { data: currentEpoch } = useCurrentEpoch();

  const proposalsContract = useQuery(
    ['proposalsContract'],
    () => contractProposals?.getProposals(currentEpoch!),
    {
      enabled: !!contractProposals && !!currentEpoch,
      select: response =>
        response?.map(([id, uri]) => ({
          id,
          uri,
        })),
    },
  );

  const proposalsIpfsResults = useQueries<BackendProposal[]>(
    (proposalsContract!.data || []).map(({ id, uri }) => ({
      enabled: !!proposalsContract && !!proposalsContract.data,
      queryFn: () => apiGetProposal(uri),
      queryKey: ['proposalsIpfsResults', id.toNumber()],
    })),
  );

  const isProposalsIpfsResultsLoading =
    proposalsIpfsResults.length === 0 || proposalsIpfsResults.some(({ isLoading }) => isLoading);

  if (isProposalsIpfsResultsLoading || !proposalsContract || !proposalsContract.data) {
    return [];
  }

  return proposalsIpfsResults.map<ExtendedProposal>((proposal, index) => ({
    id: proposalsContract!.data![index].id,
    isLoadingError: proposal.isError,
    ...(proposal.data || {}),
  }));
}
