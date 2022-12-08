import { BigNumber } from 'ethers';

import { ExtendedProposal } from 'types/proposals';

export const mockedExtendedProposal1: ExtendedProposal = {
  description: 'Mocked description',
  id: BigNumber.from(1),
  isLoadingError: false,
  landscapeImageUrl: 'https://via.placeholder.com/600x300.jpg/0000FF/FFFFFF',
  name: 'Mocked name',
  profileImageUrl: 'https://via.placeholder.com/64x64.jpg/000000/FFFFFF',
  website: {
    label: 'Website label',
    url: 'www.website.com',
  },
};

export const mockedExtendedProposal2: ExtendedProposal = {
  ...mockedExtendedProposal1,
  id: BigNumber.from(2),
};
