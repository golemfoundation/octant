import { QueryClient, UseMutateAsyncFunction } from '@tanstack/react-query';

import {
  WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER,
  WINDOW_PROJECTS_SCROLL_Y,
  CYPRESS_IS_PROJECT_ADMIN,
} from 'constants/window';

export declare global {
  interface Window {
    [CYPRESS_IS_PROJECT_ADMIN]?: boolean;
    Cypress?: Cypress.Cypress;
    [WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER]?: number;
    [WINDOW_PROJECTS_SCROLL_Y]?: number;
    clientReactQuery?: QueryClient;
    isTestnetCypress?: boolean;
    mutateAsyncMakeSnapshot: (type: 'pending' | 'finalized') => Promise<void>;
    mutateAsyncMoveToDecisionWindowClosed: UseMutateAsyncFunction<
      boolean,
      unknown,
      unknown,
      unknown
    >;
    mutateAsyncMoveToDecisionWindowOpen: UseMutateAsyncFunction<boolean, unknown, unknown, unknown>;
  }
}
