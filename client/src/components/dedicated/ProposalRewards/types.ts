import { ReactNode } from 'react';

export default interface ProposalRewardsProps {
  MiddleElement?: ReactNode;
  address: string;
  canFoundedAtHide?: boolean;
  className?: string;
}
