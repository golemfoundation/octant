import { BigNumber } from 'ethers';

import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export const mockedProposalATotalValueOfAllocations1: ProposalIpfsWithRewards = {
  address: 'address',
  isLoadingError: false,
  name: 'A',
  percentage: 1,
  totalValueOfAllocations: BigNumber.from(1),
};

export const mockedProposalATotalValueOfAllocationsUndefined = {
  ...mockedProposalATotalValueOfAllocations1,
  totalValueOfAllocations: undefined,
};

export const mockedProposalATotalValueOfAllocations2: ProposalIpfsWithRewards = {
  ...mockedProposalATotalValueOfAllocations1,
  totalValueOfAllocations: BigNumber.from(2),
};

export const mockedProposalBTotalValueOfAllocations2: ProposalIpfsWithRewards = {
  ...mockedProposalATotalValueOfAllocations1,
  name: 'B',
  totalValueOfAllocations: BigNumber.from(2),
};

export const mockedProposalBTotalValueOfAllocationsUndefined = {
  ...mockedProposalBTotalValueOfAllocations2,
  totalValueOfAllocations: undefined,
};

export const mockedProposalCTotalValueOfAllocations3: ProposalIpfsWithRewards = {
  ...mockedProposalATotalValueOfAllocations1,
  name: 'C',
  totalValueOfAllocations: BigNumber.from(3),
};

export const mockedProposalCTotalValueOfAllocationsUndefined = {
  ...mockedProposalCTotalValueOfAllocations3,
  totalValueOfAllocations: undefined,
};

export const mockedProposalDTotalValueOfAllocations4: ProposalIpfsWithRewards = {
  ...mockedProposalATotalValueOfAllocations1,
  name: 'D',
  totalValueOfAllocations: BigNumber.from(4),
};

export const mockedProposalDTotalValueOfAllocationsUndefined = {
  ...mockedProposalDTotalValueOfAllocations4,
  totalValueOfAllocations: undefined,
};
