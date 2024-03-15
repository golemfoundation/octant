import { BackendProposal } from './gen/backendproposal';

export interface ExtendedProject extends Partial<BackendProposal> {
  address: string;
  isLoadingError: boolean;
}
