import { ExtendedProposal } from 'types/proposals';

export const mockedExtendedProposal1: ExtendedProposal = {
  description: 'Mocked description',
  id: 1,
  isLoadingError: false,
  name: 'Mocked name',
  socialLinks: ['www.sociallink1.com', 'www.sociallink2.com'],
  website: 'www.website.com',
};

export const mockedExtendedProposal2: ExtendedProposal = {
  ...mockedExtendedProposal1,
  id: 2,
};
