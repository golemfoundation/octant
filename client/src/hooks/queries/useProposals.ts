import { useQuery } from 'react-query';

import useContractProposals from 'hooks/contracts/useContractProposals';
import { ExtendedProposal } from 'types/proposals';

import useCurrentEpoch from './useCurrentEpoch';
import useIpfsProposals from './useIpfsProposals';

export default function useProposals(): { proposals: ExtendedProposal[] } {
  const contractProposals = useContractProposals();
  const { data: currentEpoch } = useCurrentEpoch();

  const { data: proposalsContract } = useQuery(
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

  return useIpfsProposals(proposalsContract);
}
