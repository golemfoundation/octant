/// <reference types="cypress" />

declare namespace Cypress {
  interface ApplicationWindow {
    // Importing QueryClient breaks <reference types="cypress" /> making these types not visible.
    clientReactQuery: any;
    mutateAsyncMoveToDecisionWindowClosed: () => Promise<number>;
    mutateAsyncMoveToDecisionWindowOpen: () => Promise<number>;
    timeToIncrease?: number;
  }
}
