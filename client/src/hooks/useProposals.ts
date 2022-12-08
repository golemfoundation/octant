import { useQuery } from 'react-query';

import { ExtendedProposal } from 'types/proposals';
import env from 'env';

import { useEpochsContract, useProposalsContract } from './useContract';
import { useIpfsProposals } from './useIpfsProposals';

import { IProposals } from '../../../typechain-types';

export function useProposals(): [ExtendedProposal[]] {
  const { proposalsAddress, epochsAddress } = env;
  const contractEpochs = useEpochsContract(epochsAddress);
  const contractProposals = useProposalsContract(proposalsAddress);

  const { data: currentEpoch } = useQuery(
    ['currentEpoch'],
    () => contractEpochs?.getCurrentEpoch(),
    { enabled: !!contractEpochs },
  );

  const { data: proposalsContract } = useQuery<IProposals.ProposalStructOutput[] | undefined>(
    ['proposalsContract'],
    () => contractProposals?.getProposals(currentEpoch!),
    { enabled: !!contractProposals && !!currentEpoch },
  );

  return useIpfsProposals(proposalsContract);
}
