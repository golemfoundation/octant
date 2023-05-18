import { ProposalWithRewards } from 'hooks/queries/useProposalsWithRewards';

export default interface ProposalItemProps extends ProposalWithRewards {
  className?: string;
  dataTest?: string;
}
