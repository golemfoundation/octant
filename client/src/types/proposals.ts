export interface BackendProposal {
  description: string;
  name: string;
  profileImageCID: string;
  website: {
    label?: string;
    url: string;
  };
}

export interface ExtendedProposal extends Partial<BackendProposal> {
  address: string;
  isLoadingError: boolean;
}
