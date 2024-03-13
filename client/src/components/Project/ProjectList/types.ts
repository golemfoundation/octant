import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export default interface ProjectListProps {
  epoch?: number;
  proposals: ProposalIpfsWithRewards[];
}
