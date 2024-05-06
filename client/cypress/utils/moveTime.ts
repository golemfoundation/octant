import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  ALLOCATION_ITEMS_KEY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import { mockCoinPricesServer, visitWithLoader } from './e2e';

import Chainable = Cypress.Chainable;

export const setupAndMoveToPlayground = (): Chainable<any> => {
  cy.disconnectMetamaskWalletFromAllDapps();
  mockCoinPricesServer();
  localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
  localStorage.setItem(IS_ONBOARDING_DONE, 'true');
  localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
  return visitWithLoader(ROOT_ROUTES.playground.absolute);
};

const mutateAsyncMoveToDecisionWindowClosed = (cypressWindow: Cypress.AUTWindow): Promise<any> =>
  new Promise(resolve => {
    cypressWindow.mutateAsyncMoveToDecisionWindowClosed().then(() => {
      resolve(true);
    });
  });

export const mutateAsyncMakeSnapshot = (
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

const waitForLoadersToDisappear = (): Chainable<any> => {
  cy.get('[data-test*=AppLoader]').should('not.exist');
  return cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
};

const moveToDecisionWindowOpen = (cypressWindow: Cypress.AUTWindow): Chainable<any> => {
  waitForLoadersToDisappear();
  cy.wrap(null).then(() => {
    return mutateAsyncMoveToDecisionWindowOpen(cypressWindow).then(str => {
      expect(str).to.eq(true);
    });
  });
  waitForLoadersToDisappear();
  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  cy.wrap(null).then(() => {
    return mutateAsyncMakeSnapshot(cypressWindow, 'pending').then(str => {
      expect(str).to.eq(true);
    });
  });
  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  // Reload is needed to get updated data in the app
  cy.reload();
  return waitForLoadersToDisappear();
};

const moveToDecisionWindowClosed = (cypressWindow: Cypress.AUTWindow): Chainable<any> => {
  cy.wrap(null).then(() => {
    return mutateAsyncMoveToDecisionWindowClosed(cypressWindow).then(str => {
      expect(str).to.eq(true);
    });
  });
  waitForLoadersToDisappear();
  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  cy.wrap(null).then(() => {
    return mutateAsyncMakeSnapshot(cypressWindow, 'finalized').then(str => {
      expect(str).to.eq(true);
    });
  });
  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  // Reload is needed to get updated data in the app
  cy.reload();
  return waitForLoadersToDisappear();
};

/**
 * General note: this util moves the time to the next epoch, window open or closed.
 * In the future we will add ability to move to window closed without changing the epoch.
 */
export const moveTime = (
  cypressWindow: Cypress.AUTWindow,
  moveTo: 'nextEpochDecisionWindowClosed' | 'nextEpochDecisionWindowOpen',
  shouldMoveToPlayground = false,
): Chainable<any> => {
  if (shouldMoveToPlayground) {
    cy.disconnectMetamaskWalletFromAllDapps();
    mockCoinPricesServer();
    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
    visitWithLoader(ROOT_ROUTES.playground.absolute);
  }

  const isDecisionWindowOpen = cypressWindow.clientReactQuery.getQueryData(
    QUERY_KEYS.isDecisionWindowOpen,
  );

  if (isDecisionWindowOpen) {
    moveToDecisionWindowClosed(cypressWindow);
    waitForLoadersToDisappear();
    // reload is needed to get updated data in the app
    cy.reload();
  }

  if (moveTo === 'nextEpochDecisionWindowOpen') {
    moveToDecisionWindowOpen(cypressWindow);
  } else {
    moveToDecisionWindowOpen(cypressWindow);
    // Reload is needed to get updated data in the app
    cy.reload();
    waitForLoadersToDisappear();
    moveToDecisionWindowClosed(cypressWindow);
  }

  // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
  cy.wait(2000);
  cy.reload();
  return waitForLoadersToDisappear();
};
