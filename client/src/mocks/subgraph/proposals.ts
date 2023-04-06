import { BigNumber } from 'ethers';

import { ProposalWithRewards } from 'hooks/queries/useProposalsWithRewards';

export const mockedProposal1: ProposalWithRewards = {
  address: 'address',
  percentage: 1,
  totalValueOfAllocations: BigNumber.from(1),
};

export const mockedProposal2: ProposalWithRewards = {
  ...mockedProposal1,
  totalValueOfAllocations: BigNumber.from(2),
};

export const mockedProposal3: ProposalWithRewards = {
  ...mockedProposal1,
  totalValueOfAllocations: BigNumber.from(3),
};
