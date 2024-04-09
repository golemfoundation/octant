import { QUERY_KEYS } from 'src/api/queryKeys';

import Chainable = Cypress.Chainable;

const mutateAsyncMoveToDecisionWindowClosed = (cypressWindow: Cypress.AUTWindow) =>
  new Cypress.Promise(resolve => {
    cypressWindow.mutateAsyncMoveToDecisionWindowClosed().then(() => {
      resolve(true);
    });
  });

const mutateAsyncMakeSnapshot = (cypressWindow: Cypress.AUTWindow, type: 'pending' | 'finalized') =>
  new Cypress.Promise(resolve => {
    cypressWindow.mutateAsyncMakeSnapshot(type).then(() => {
      resolve(true);
    });
  });

const mutateAsyncMoveToDecisionWindowOpen = (cypressWindow: Cypress.AUTWindow) =>
  new Cypress.Promise(resolve => {
    cypressWindow.mutateAsyncMoveToDecisionWindowOpen().then(() => {
      resolve(true);
    });
  });

const loaderCheck = (): Chainable<any> => {
  cy.get('[data-test*=AppLoader]').should('not.exist');
  return cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
};

const moveToDecisionWindowOpen = (cypressWindow: Cypress.AUTWindow): Chainable<any> => {
  loaderCheck();
  cy.wrap(null).then(() => {
    return mutateAsyncMoveToDecisionWindowOpen(cypressWindow).then(str => {
      expect(str).to.eq(true);
    });
  });
  loaderCheck();
  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  cy.wrap(null).then(() => {
    return mutateAsyncMakeSnapshot(cypressWindow, 'pending').then(str => {
      expect(str).to.eq(true);
    });
  });
  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  // reload is needed to get updated data in the app
  cy.reload();
  return loaderCheck();
};

const moveToDecisionWindowClosed = (cypressWindow: Cypress.AUTWindow): Chainable<any> => {
  loaderCheck();
  cy.wrap(null).then(() => {
    return mutateAsyncMoveToDecisionWindowClosed(cypressWindow).then(str => {
      expect(str).to.eq(true);
    });
  });
  loaderCheck();
  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  cy.wrap(null).then(() => {
    return mutateAsyncMakeSnapshot(cypressWindow, 'finalized').then(str => {
      expect(str).to.eq(true);
    });
  });
  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  // reload is needed to get updated data in the app
  cy.reload();
  return loaderCheck();
};

export const moveEpoch = (
  cypressWindow: Cypress.AUTWindow,
  moveTo: 'decisionWindowClosed' | 'decisionWindowOpen',
): Chainable<any> => {
  const isDecisionWindowOpen = cypressWindow.clientReactQuery.getQueryData(
    QUERY_KEYS.isDecisionWindowOpen,
  );

  if (isDecisionWindowOpen) {
    moveToDecisionWindowClosed(cypressWindow);
    // reload is needed to get updated data in the app
    cy.reload();
  }

  if (moveTo === 'decisionWindowOpen') {
    moveToDecisionWindowOpen(cypressWindow);
  } else {
    moveToDecisionWindowOpen(cypressWindow);
    // reload is needed to get updated data in the app
    cy.reload();
    moveToDecisionWindowClosed(cypressWindow);
    // reload is needed to get updated data in the app
  }

  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(5000);
  cy.reload();
  return loaderCheck();
};
