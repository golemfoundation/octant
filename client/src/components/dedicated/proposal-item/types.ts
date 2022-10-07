import { ExtendedProposal } from 'views/proposals-view/types';

import { Allocations } from '../../../typechain-types';

export interface ProposalItemProps extends ExtendedProposal {
  contractAllocations: Allocations | null;
}
