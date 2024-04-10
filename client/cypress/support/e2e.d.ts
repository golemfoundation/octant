/// <reference types="cypress" />

declare namespace Cypress {
  interface ApplicationWindow {
    // Importing QueryClient breaks <reference types="cypress" /> making these types not visible.
    clientReactQuery: any;
    mutateAsyncMakeSnapshot: (type: 'pending' | 'finalized') => Promise<void>;
    mutateAsyncMoveToDecisionWindowClosed: () => Promise<void>;
    mutateAsyncMoveToDecisionWindowOpen: () => Promise<void>;
  }
}
