import { BigNumber } from 'ethers';

export interface BackendProposal {
  description: string;
  name: string;
  socialLinks: string[];
  website: string;
}

export interface ExtendedProposal extends BackendProposal {
  id: BigNumber;
  isLoadingError: boolean;
}
