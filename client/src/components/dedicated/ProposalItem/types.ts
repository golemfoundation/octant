import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export default interface ProposalItemProps extends ProposalIpfsWithRewards {
  className?: string;
  dataTest?: string;
}
