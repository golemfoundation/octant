import { navigationTabs } from 'src/constants/navigationTabs/navigationTabs';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import { ConnectWalletParameters } from './types';

import Chainable = Cypress.Chainable;

export const ETH_USD = 2042.0;
export const GLM_USD = 0.260878;

export const loadersShouldNotExist = (): Chainable<any> => {
  cy.get('[data-test*=AppLoader]').should('not.exist');
  return cy.get('[data-test=MainLayout__Loader]').should('not.exist');
};

export const checkLocationWithLoader = (url: string): Chainable<any> => {
  // First loaders, since user can be moved between the routes before they disappear.
  loadersShouldNotExist();
  return cy.location('pathname').should('eq', url);
};

export const visitWithLoader = (
  urlEnter: string,
  urlEnd?: string,
  visitOptions?: Partial<Cypress.VisitOptions>,
): Chainable<any> => {
  cy.visit(urlEnter, visitOptions);
  return checkLocationWithLoader(urlEnd || urlEnter);
};

export const navigateWithCheck = (urlEnter: string): Chainable<any> => {
  const { label } = navigationTabs.find(({ to }) => to === urlEnter)!;
  cy.get(`[data-test=Navbar__Button--${label}]`).click();
  return checkLocationWithLoader(urlEnter);
};

export const mockCoinPricesServer = (): Chainable<any> => {
  return cy.intercept('GET', '/simple/price?*', {
    body: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
    statusCode: 200,
  });
};

export const connectWallet = ({
  isTOSAccepted = false,
  isPatronModeEnabled = false,
}: ConnectWalletParameters): Chainable<any> => {
  cy.intercept('GET', '/user/*/tos', { body: { accepted: isTOSAccepted } });
  cy.intercept('GET', '/user/*/patron-mode', { body: { status: isPatronModeEnabled } });
  cy.intercept('PATCH', '/user/*/patron-mode', { body: { status: !isPatronModeEnabled } });
  cy.disconnectMetamaskWalletFromAllDapps();
  cy.wait(500);
  cy.get('[data-test=MainLayout__Button--connect]').click();
  cy.wait(500);
  cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').click();
  cy.switchToMetamaskNotification();
  return cy.acceptMetamaskAccess();
};

export const checkProjectsViewLoaded = (): Chainable<any> => {
  /**
   * Skeletons appear only after app fetches the addresses.
   * Before that, there are no children there. An additional check for data-isloading hence.
   */
  cy.get('[data-test=ProjectsView__ProjectsList]')
    .invoke('attr', 'data-isloading')
    .should('eq', 'false');

  cy.get('body').then($body => {
    if ($body.find('[data-test=ProjectsView__ProjectsList--archive]').length > 0) {
      cy.get('[data-test=ProjectsView__ProjectsList--archive]')
        .invoke('attr', 'data-isloading')
        .should('eq', 'false');
    }
  });

  return cy.get('[data-test^=ProjectItemSkeleton').should('not.exist');
};

export const changeMainValueToFiat = (endUrl: string): Chainable<any> => {
  navigateWithCheck(ROOT_ROUTES.settings.absolute);
  cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').uncheck();
  return navigateWithCheck(endUrl);
};
