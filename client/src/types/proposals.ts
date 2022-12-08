import { BigNumber } from 'ethers';

export interface BackendProposal {
  description: string;
  landscapeImageUrl: string;
  name: string;
  profileImageUrl: string;
  website: {
    label?: string;
    url: string;
  };
}

export interface ExtendedProposal extends BackendProposal {
  id: BigNumber;
  isLoadingError: boolean;
}
