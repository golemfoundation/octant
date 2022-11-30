import { useEffect, useState } from 'react';
import { useQueries, useQuery } from 'react-query';

import { BackendProposal, ExtendedProposal } from 'types/proposals';
import { apiGetProposal } from 'api/proposals';
import env from 'env';

import { useProposalsContract } from './useContract';

import { Proposals } from '../../../typechain-types';

export function useProposals(): [ExtendedProposal[]] {
  const { proposalsAddress } = env;
  const [proposals, setProposals] = useState<ExtendedProposal[]>([]);
  const contractProposals = useProposalsContract(proposalsAddress);

  const { data: proposalsContract } = useQuery<Proposals.ProposalStructOutput[] | undefined>(
    ['proposalsContract'],
    () => contractProposals?.getProposals(),
    { enabled: !!contractProposals },
  );

  const proposalsIpfsResults = useQueries<BackendProposal[]>(
    (proposalsContract || []).map(({ id, uri }) => {
      return {
        queryFn: () => apiGetProposal(uri),
        queryKey: ['proposalsIpfsResults', id],
      };
    }),
  );

  const isProposalsIpfsResultsLoading = proposalsIpfsResults.some(({ isLoading }) => isLoading);

  useEffect(() => {
    if (isProposalsIpfsResultsLoading) {
      return;
    }

    const parsedProposals = isProposalsIpfsResultsLoading
      ? []
      : proposalsIpfsResults.map<ExtendedProposal>((proposal, index) => ({
          ...(proposal.data as BackendProposal),
          id: proposalsContract![index].id,
          isLoadingError: proposal.isError,
        }));

    setProposals(parsedProposals);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProposalsIpfsResultsLoading]);

  return [proposals];
}
