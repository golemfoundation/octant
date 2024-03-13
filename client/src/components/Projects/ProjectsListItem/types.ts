import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export default interface ProjectsListItemProps {
  className?: string;
  dataTest?: string;
  epoch?: number;
  proposalIpfsWithRewards: ProposalIpfsWithRewards;
}
