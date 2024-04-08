import axios from 'axios';

import { QUERY_KEYS } from 'src/api/queryKeys';
import { navigationTabs } from 'src/constants/navigationTabs/navigationTabs';
import env from 'src/env';

import Chainable = Cypress.Chainable;

export const ETH_USD = 2041.91;

export const loadersShouldNotExist = (): Chainable<any> => {
  cy.get('[data-test*=AppLoader]').should('not.exist');
  return cy.get('[data-test=MainLayout__Loader]').should('not.exist');
};

export const checkLocationWithLoader = (url: string): Chainable<any> => {
  // First loaders, since user can be moved between the routes before they disappear.
  loadersShouldNotExist();
  return cy.location('pathname').should('eq', url);
};

export const visitWithLoader = (urlEnter: string, urlEnd?: string): Chainable<any> => {
  cy.visit(urlEnter);
  return checkLocationWithLoader(urlEnd || urlEnter);
};

export const navigateWithCheck = (urlEnter: string): Chainable<any> => {
  const { label } = navigationTabs.find(({ to }) => to === urlEnter)!;
  cy.get(`[data-test=Navbar__Button--${label}]`).click();
  return checkLocationWithLoader(urlEnter);
};

export const mockCoinPricesServer = (): Chainable<any> => {
  return cy.intercept('GET', '/simple/price?*', {
    body: { ethereum: { usd: ETH_USD }, golem: { usd: 0.260878 } },
    statusCode: 200,
  });
};

export const connectWallet = (
  isTOSAccepted: boolean,
  isPatronModeEnabled: boolean,
): Chainable<any> => {
  cy.intercept('GET', '/user/*/tos', { body: { accepted: isTOSAccepted } });
  cy.intercept('GET', '/user/*/patron-mode', { body: { status: isPatronModeEnabled } });
  cy.intercept('PATCH', '/user/*/patron-mode', { body: { status: !isPatronModeEnabled } });
  cy.disconnectMetamaskWalletFromAllDapps();
  cy.get('[data-test=MainLayout__Button--connect]').click();
  cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').click();
  cy.switchToMetamaskNotification();
  return cy.acceptMetamaskAccess();
};

const test = (cypressWindow, moveTo): Promise<boolean> => {
  return new Promise(resolve => {
    if (moveTo === 'decisionWindowOpen') {
      cypressWindow.mutateAsyncMoveToDecisionWindowOpen().then(() => {
        // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
        cy.wait(2000);
        axios.post(`${env.serverEndpoint}snapshots/pending`).then(() => {
          cy.log('3');
          // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
          cy.wait(2000);
          // reload is needed to get updated data in the app
          cy.reload();
          cy.get('[data-test*=AppLoader]').should('not.exist');
          cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
          // reload is needed to get updated data in the app
          cy.reload();
          resolve(true);
        });
      });
    } else {
      cypressWindow.mutateAsyncMoveToDecisionWindowOpen().then(() => {
        // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
        cy.wait(2000);
        axios.post(`${env.serverEndpoint}snapshots/pending`).then(() => {
          cy.log('3');
          // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
          cy.wait(2000);
          // reload is needed to get updated data in the app
          cy.reload();
          cy.get('[data-test*=AppLoader]').should('not.exist');
          cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
          // reload is needed to get updated data in the app
          cy.reload();
          cypressWindow.mutateAsyncMoveToDecisionWindowClosed().then(() => {
            cy.log('4');
            // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
            cy.wait(2000);
            axios.post(`${env.serverEndpoint}snapshots/finalized`).then(() => {
              // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
              cy.wait(2000);
              // reload is needed to get updated data in the app
              cy.reload();
              cy.get('[data-test*=AppLoader]').should('not.exist');
              cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
              // reload is needed to get updated data in the app
              cy.reload();
              resolve(true);
            });
          });
        });
      });
    }
  });
};

export const moveEpoch = (
  cypressWindow: Cypress.AUTWindow,
  moveTo: 'decisionWindowClosed' | 'decisionWindowOpen',
): Chainable<any> => {

  const isDecisionWindowOpen = cypressWindow.clientReactQuery.getQueryData(
    QUERY_KEYS.isDecisionWindowOpen,
  );

  const f1 = new Promise(resolve => {
    cypressWindow.mutateAsyncMoveToDecisionWindowClosed().then(() => {
      resolve(true);
    });
  });

  const f2 = new Promise(resolve => {
    axios.post(`${env.serverEndpoint}snapshots/finalized`).then(() => {
      resolve(true);
    });
  });

  const f3 = new Promise(resolve => {
    cypressWindow.mutateAsyncMoveToDecisionWindowOpen().then(() => {
      resolve(true);
    });
  });

  const f4 = new Promise(resolve => {
    axios.post(`${env.serverEndpoint}snapshots/pending`).then(() => {
      resolve(true);
    });
  });

  if (isDecisionWindowOpen) {
    cy.wrap(f1).its('value').should('eq', true);
    cy.log('1');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    cy.wrap(f2).its('value').should('eq', true);
    cy.log('2');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', {timeout: 60000}).should('not.exist');
    // reload is needed to get updated data in the app
    cy.reload();
  }

  if (moveTo === 'decisionWindowOpen') {
    cy.wrap(f3).its('value').should('eq', true);
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    cy.wrap(f4).its('value').should('eq', true);
    cy.log('3');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
  } else {
    cy.wrap(f3).its('value').should('eq', true);
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    cy.wrap(f4).its('value').should('eq', true);
    cy.log('3');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    // reload is needed to get updated data in the app
    cy.reload();
    cy.wrap(f1).its('value').should('eq', true);
    cy.log('4');
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    cy.wrap(f2).its('value').should('eq', true);
    // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
    cy.wait(2000);
    // reload is needed to get updated data in the app
    cy.reload();
    cy.get('[data-test*=AppLoader]').should('not.exist');
    cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    // reload is needed to get updated data in the app
    cy.reload();
  }

  return cy.reload();
};
