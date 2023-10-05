import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export default interface ProposalsListItemProps extends ProposalIpfsWithRewards {
  className?: string;
  dataTest?: string;
  epoch?: number;
}
