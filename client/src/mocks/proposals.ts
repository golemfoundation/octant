import { BigNumber } from 'ethers';

import { ExtendedProposal } from 'types/proposals';

export const mockedProposal1: ExtendedProposal = {
  description: 'description',
  id: BigNumber.from(1),
  isLoadingError: false,
  landscapeImageUrl: 'http://www.landscapeImageUrl.html',
  name: 'name',
  profileImageUrl: 'http://www.profileImageUrl.html',
  website: {
    label: 'website label',
    url: 'http://www.websiteUrl.html',
  },
};

export const mockedProposal2: ExtendedProposal = {
  ...mockedProposal1,
  id: BigNumber.from(2),
};

export const mockedProposal3: ExtendedProposal = {
  ...mockedProposal1,
  id: BigNumber.from(3),
};
