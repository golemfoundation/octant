import { BigNumber } from 'ethers';

import { ProposalWithAllocations } from 'components/dedicated/ProposalItem/types';

export const mockedProposal1: ProposalWithAllocations = {
  address: 'address',
  description: 'description',
  isLoadingError: false,
  landscapeImageCID: 'landscapeImageCID',
  name: 'name',
  percentage: 1,
  profileImageCID: 'profileImageCID',
  totalValueOfAllocations: BigNumber.from(1),
  website: {
    label: 'label',
    url: 'url',
  },
};

export const mockedProposal2: ProposalWithAllocations = {
  ...mockedProposal1,
  totalValueOfAllocations: BigNumber.from(2),
};

export const mockedProposal3: ProposalWithAllocations = {
  ...mockedProposal1,
  totalValueOfAllocations: BigNumber.from(3),
};
