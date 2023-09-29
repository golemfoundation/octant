import { ReactElement } from 'react';

export interface ProtectedProps {
  children: ReactElement;
  isSyncingInProgress: boolean;
}

export default interface RootRoutesProps {
  isSyncingInProgress: boolean;
}
