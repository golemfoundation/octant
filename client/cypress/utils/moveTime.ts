import { QUERY_KEYS } from 'src/api/queryKeys';

import Chainable = Cypress.Chainable;

const mutateAsyncMoveToDecisionWindowClosed = (cypressWindow: Cypress.AUTWindow): Promise<any> =>
  new Promise(resolve => {
    cypressWindow.mutateAsyncMoveToDecisionWindowClosed().then(() => {
      resolve(true);
    });
  });

const mutateAsyncMakeSnapshotFinalized = (
  cypressWindow: Cypress.AUTWindow,
  type: 'finalized' | 'pending',
): Promise<any> =>
  new Cypress.Promise(resolve => {
    cypressWindow.mutateAsyncMakeSnapshot(type).then(() => {
      resolve(true);
    });
  });

const mutateAsyncMoveToDecisionWindowOpen = (cypressWindow: Cypress.AUTWindow): Promise<any> =>
  new Cypress.Promise(resolve => {
    cypressWindow.mutateAsyncMoveToDecisionWindowOpen().then(() => {
      resolve(true);
    });
  });

const mutateAsyncMakeSnapshotPending = (cypressWindow: Cypress.AUTWindow): Promise<any> =>
  new Cypress.Promise(resolve => {
    cypressWindow.mutateAsyncMakeSnapshot('pending').then(() => {
      resolve(true);
    });
  });

export const moveEpoch = (
  cypressWindow: Cypress.AUTWindow,
  moveTo: 'decisionWindowClosed' | 'decisionWindowOpen',
): Chainable<any> => {
  const isDecisionWindowOpen = cypressWindow.clientReactQuery.getQueryData(
    QUERY_KEYS.isDecisionWindowOpen,
  );

  if (isDecisionWindowOpen) {
    cy.wrap(null).then(() => {
      return mutateAsyncMoveToDecisionWindowClosed(cypressWindow).then(str => {
        expect(str).to.eq(true);
      });
    });
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    cy.log('1');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    cy.wrap(null).then(() => {
      return mutateAsyncMakeSnapshotFinalized(cypressWindow, 'finalized').then(str => {
        expect(str).to.eq(true);
      });
    });
    cy.log('2');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    // reload is needed to get updated data in the app
    cy.reload();
  }

  if (moveTo === 'decisionWindowOpen') {
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    cy.wrap(null).then(() => {
      return mutateAsyncMoveToDecisionWindowOpen(cypressWindow).then(str => {
        expect(str).to.eq(true);
      });
    });
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    cy.wrap(null).then(() => {
      return mutateAsyncMakeSnapshotPending(cypressWindow).then(str => {
        expect(str).to.eq(true);
      });
    });
    cy.log('3');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
  } else {
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    cy.wrap(null).then(() => {
      return mutateAsyncMoveToDecisionWindowOpen(cypressWindow).then(str => {
        expect(str).to.eq(true);
      });
    });
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    cy.wrap(null).then(() => {
      return mutateAsyncMakeSnapshotPending(cypressWindow).then(str => {
        expect(str).to.eq(true);
      });
    });
    cy.log('3');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    cy.wrap(null).then(() => {
      return mutateAsyncMoveToDecisionWindowClosed(cypressWindow).then(str => {
        expect(str).to.eq(true);
      });
    });
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    cy.log('4');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    cy.wrap(null).then(() => {
      return mutateAsyncMakeSnapshotFinalized(cypressWindow, 'finalized').then(str => {
        expect(str).to.eq(true);
      });
    });
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    // reload is needed to get updated data in the app
  }

  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(5000);
  cy.reload();
  cy.get('[data-test*=AppLoader]').should('not.exist');
  return cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
};
