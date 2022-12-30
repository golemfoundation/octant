import { BigNumber } from 'ethers';

import { ExtendedProposal } from 'types/proposals';

export const mockedExtendedProposal1: ExtendedProposal = {
  description: 'Mocked description',
  id: BigNumber.from(1),
  isLoadingError: false,
  landscapeImageCID: 'QmUSyN5ePrfbYWvprLEfMVPH52b45egJnWKakgwrg8GFkm',
  name: 'Mocked name',
  profileImageCID: 'QmVXiFmCbdmMFbKAqDvKhAG89jAzktoHc2x3vwDhPnHj9U',
  website: {
    label: 'Website label',
    url: 'www.website.com',
  },
};

export const mockedExtendedProposal2: ExtendedProposal = {
  ...mockedExtendedProposal1,
  id: BigNumber.from(2),
};
