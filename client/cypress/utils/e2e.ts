import axios from 'axios';

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

export const moveEpoch = (cypressWindow: Cypress.AUTWindow): Promise<boolean> => {
  return new Promise(resolve => {
    cypressWindow.mutateAsyncMoveEpoch().then(() => {
      // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
      cy.wait(2000);
      // Manually taking a pending snapshot after the epoch shift ensures that the snapshot is taken. Passing epoch multiple times without manually triggering pending snapshot in a short period of time may cause the e2e environment to fail.
      axios.post(`${env.serverEndpoint}snapshots/pending`).then(() => {
        // Waiting 2s is a way to prevent the effects of slowing down the e2e environment (data update).
        cy.wait(2000);
        cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
        // reload is needed to get updated data in the app
        cy.reload();
        axios.post(`${env.serverEndpoint}snapshots/finalized`).then(() => {
          cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
          resolve(true);
        });
      });
    });
  });
};
