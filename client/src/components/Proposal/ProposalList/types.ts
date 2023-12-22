import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export default interface ProposalListProps {
  epoch?: number;
  proposals: ProposalIpfsWithRewards[];
}
