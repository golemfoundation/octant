import { ReactNode } from 'react';

import ProposalItemProps from 'components/dedicated/ProposalItem/types';

export default interface ProposalRewardsProps {
  MiddleElement?: ReactNode;
  canFoundedAtHide?: boolean;
  className?: string;
  totalValueOfAllocations: ProposalItemProps['totalValueOfAllocations'];
}
