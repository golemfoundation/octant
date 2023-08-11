import { BigNumber } from 'ethers';

import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export const mockedProposalA: ProposalIpfsWithRewards = {
  address: 'address',
  isLoadingError: false,
  name: 'A',
  percentage: 1,
  totalValueOfAllocations: BigNumber.from(1),
};

export const mockedProposalANoAllocation = {
  ...mockedProposalA,
  totalValueOfAllocations: undefined,
};

export const mockedProposalAHigherAllocation: ProposalIpfsWithRewards = {
  ...mockedProposalA,
  totalValueOfAllocations: BigNumber.from(2),
};

export const mockedProposalB: ProposalIpfsWithRewards = {
  ...mockedProposalA,
  name: 'B',
  totalValueOfAllocations: BigNumber.from(2),
};

export const mockedProposalBNoAllocation = {
  ...mockedProposalB,
  totalValueOfAllocations: undefined,
};

export const mockedProposalC: ProposalIpfsWithRewards = {
  ...mockedProposalA,
  name: 'C',
  totalValueOfAllocations: BigNumber.from(3),
};

export const mockedProposalCNoAllocation = {
  ...mockedProposalC,
  totalValueOfAllocations: undefined,
};

export const mockedProposalD: ProposalIpfsWithRewards = {
  ...mockedProposalA,
  name: 'D',
  totalValueOfAllocations: BigNumber.from(4),
};

export const mockedProposalDNoAllocation = {
  ...mockedProposalD,
  totalValueOfAllocations: undefined,
};
