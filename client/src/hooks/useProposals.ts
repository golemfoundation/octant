import { useQuery } from 'react-query';

import { ExtendedProposal } from 'types/proposals';

import useContractProposals from './contracts/useContractProposals';
import useCurrentEpoch from './useCurrentEpoch';
import useIpfsProposals from './useIpfsProposals';

import { IProposals } from '../../../typechain-types';

export default function useProposals(): [ExtendedProposal[]] {
  const contractProposals = useContractProposals();
  const { data: currentEpoch } = useCurrentEpoch();

  const { data: proposalsContract } = useQuery<IProposals.ProposalStructOutput[] | undefined>(
    ['proposalsContract'],
    () => contractProposals?.getProposals(currentEpoch!),
    { enabled: !!contractProposals && !!currentEpoch },
  );

  return useIpfsProposals(proposalsContract);
}
