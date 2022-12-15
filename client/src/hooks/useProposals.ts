import { useQuery } from 'react-query';

import { ExtendedProposal } from 'types/proposals';
import env from 'env';

import useCurrentEpoch from './useCurrentEpoch';
import useIpfsProposals from './useIpfsProposals';
import useProposalsContract from './contracts/useProposalsContract';

import { IProposals } from '../../../typechain-types';

export default function useProposals(): [ExtendedProposal[]] {
  const { proposalsAddress } = env;
  const contractProposals = useProposalsContract(proposalsAddress);
  const { data: currentEpoch } = useCurrentEpoch();

  const { data: proposalsContract } = useQuery<IProposals.ProposalStructOutput[] | undefined>(
    ['proposalsContract'],
    () => contractProposals?.getProposals(currentEpoch!),
    { enabled: !!contractProposals && !!currentEpoch },
  );

  return useIpfsProposals(proposalsContract);
}
