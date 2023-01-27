import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { useQueries } from 'react-query';

import { apiGetProposal } from 'api/proposals';
import { BackendProposal, ExtendedProposal } from 'types/proposals';

import { IProposals } from '../../../typechain-types';

export default function useIpfsProposals(
  proposalsContract:
    | IProposals.ProposalStructOutput[]
    | { id: BigNumber; uri: string }[]
    | undefined,
): { proposals: ExtendedProposal[] } {
  const [proposals, setProposals] = useState<ExtendedProposal[]>([]);
  const [isProposalsIpfsResultsLoading, setIsProposalsIpfsResultsLoading] = useState<boolean>(true);

  const proposalsIpfsResults = useQueries<BackendProposal[]>(
    (proposalsContract || []).map(({ id, uri }) => ({
      queryFn: () => apiGetProposal(uri),
      queryKey: ['proposalsIpfsResults', id],
    })),
  );

  useEffect(() => {
    if (proposalsIpfsResults.length > 0) {
      setIsProposalsIpfsResultsLoading(proposalsIpfsResults.some(({ isLoading }) => isLoading));
    }
  }, [proposalsIpfsResults, setIsProposalsIpfsResultsLoading]);

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

  return { proposals };
}
