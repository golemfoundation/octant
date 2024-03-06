import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export const mockedProposalATotalValueOfAllocations1: ProposalIpfsWithRewards = {
  address: 'address',
  isLoadingError: false,
  name: 'A',
  numberOfDonors: 10,
  percentage: 1,
  totalValueOfAllocations: BigInt(1),
};

export const mockedProposalATotalValueOfAllocationsUndefined = {
  ...mockedProposalATotalValueOfAllocations1,
  totalValueOfAllocations: undefined,
};

export const mockedProposalATotalValueOfAllocations2: ProposalIpfsWithRewards = {
  ...mockedProposalATotalValueOfAllocations1,
  totalValueOfAllocations: BigInt(2),
};

export const mockedProposalBTotalValueOfAllocations2: ProposalIpfsWithRewards = {
  ...mockedProposalATotalValueOfAllocations1,
  name: 'B',
  totalValueOfAllocations: BigInt(2),
};

export const mockedProposalBTotalValueOfAllocationsUndefined = {
  ...mockedProposalBTotalValueOfAllocations2,
  totalValueOfAllocations: undefined,
};

export const mockedProposalCTotalValueOfAllocations3: ProposalIpfsWithRewards = {
  ...mockedProposalATotalValueOfAllocations1,
  name: 'C',
  totalValueOfAllocations: BigInt(3),
};

export const mockedProposalCTotalValueOfAllocationsUndefined = {
  ...mockedProposalCTotalValueOfAllocations3,
  totalValueOfAllocations: undefined,
};

export const mockedProposalDTotalValueOfAllocations4: ProposalIpfsWithRewards = {
  ...mockedProposalATotalValueOfAllocations1,
  name: 'D',
  totalValueOfAllocations: BigInt(4),
};

export const mockedProposalDTotalValueOfAllocationsUndefined = {
  ...mockedProposalDTotalValueOfAllocations4,
  totalValueOfAllocations: undefined,
};
