import { BigNumber } from 'ethers';

export interface BackendProposal {
  description: string;
  landscapeImageCID: string;
  name: string;
  profileImageCID: string;
  website: {
    label?: string;
    url: string;
  };
}

export interface ExtendedProposal extends Partial<BackendProposal> {
  id: BigNumber;
  isLoadingError: boolean;
}
