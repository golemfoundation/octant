import { ReactNode } from 'react';

export default interface ProposalLoadingStatesProps {
  children: ReactNode;
  isLoading?: boolean;
  isLoadingError: boolean;
}
