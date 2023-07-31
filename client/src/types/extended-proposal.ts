import { BackendProposal } from './gen/backendproposal';

export interface ExtendedProposal extends Partial<BackendProposal> {
  address: string;
  isLoadingError: boolean;
}
