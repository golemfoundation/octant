import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export default interface ProposalsListItemProps {
  className?: string;
  dataTest?: string;
  epoch?: number;
  proposalIpfsWithRewards: ProposalIpfsWithRewards;
}
