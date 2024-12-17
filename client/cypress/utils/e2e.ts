import { IS_CRYPTO_MAIN_VALUE_DISPLAY } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import { ConnectWalletParameters } from './types';

import Chainable = Cypress.Chainable;

export const ETH_USD = 2042.0;
export const GLM_USD = 0.260878;

export const loadersShouldNotExist = (): Chainable<any> => {
  cy.get('[data-test*=AppLoader]').should('not.exist');
  return cy.get('[data-test=Layout__Loader]').should('not.exist');
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

export const mockCoinPricesServer = (): Chainable<any> => {
  return cy.intercept('GET', '/simple/price?*', {
    body: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
    statusCode: 200,
  });
};

export const connectWallet = ({
  isPatronModeEnabled = false,
  isUQScoreBelow15 = false,
  isSybil = false,
}: ConnectWalletParameters): Chainable<any> => {
  // In CI, e2e tests are run serially and mocking TOS response is not required
  // Uncomment snippet below to mock TOS GET response in development
  // cy.intercept('GET', '/user/*/tos', { body: { accepted: true } });

  cy.intercept('GET', '/user/*/uq/*', {
    body: { uniquenessQuotient: isUQScoreBelow15 ? '0.01' : '1.0' },
  });
  cy.intercept('GET', '/user/*/patron-mode', { body: { status: isPatronModeEnabled } });
  cy.intercept('GET', '/user/*/antisybil-status', {
    body: {
      expires_at: null,
      isOnTimeOutList: isSybil,
      score: isUQScoreBelow15 ? 10 : 100,
      status: 'Known',
    },
  });
  cy.intercept('PUT', '/user/*/antisybil-status', { statusCode: 204 });
  cy.intercept('GET', '/delegation/check/*', {
    body: {
      primary: '',
      secondary: '',
    },
  });
  cy.intercept('PATCH', '/user/*/patron-mode', { body: { status: !isPatronModeEnabled } });
  cy.intercept('POST', '/allocations/leverage/*', {
    body: { leverage: '100', matched: [], threshold: null },
  });
  /**
   * Setting intercepts here is too late. It should be done before view loads.
   * Making a reload is hack to skip that.
   */
  cy.reload();
  loadersShouldNotExist();
  cy.disconnectMetamaskWalletFromAllDapps();
  cy.wait(500);
  cy.reload();
  cy.wait(500);
  cy.get('[data-test=LayoutTopBar__Button]').click();
  cy.wait(1000);
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

export const changeMainValueToCryptoToggle = (
  isDesktopTypeView: boolean,
  changeToCryptoOrFiat: 'crypto' | 'fiat',
): Chainable<any> => {
  visitWithLoader(
    ROOT_ROUTES.settings.absolute,
    isDesktopTypeView ? ROOT_ROUTES.home.absolute : ROOT_ROUTES.settings.absolute,
  );
  if (isDesktopTypeView) {
    cy.get('[data-test=SettingsDrawer]').should('be.visible');
    cy.get('[data-test=SettingsView]').should('not.exist');
  } else {
    cy.get('[data-test=SettingsDrawer]').should('not.exist');
    cy.get('[data-test=SettingsView]').should('be.visible');
  }
  if (changeToCryptoOrFiat === 'crypto') {
    cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').check({ force: true });
    cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('be.checked');
    cy.getAllLocalStorage().then(() => {
      expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('true');
    });
  } else {
    cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').uncheck({ force: true });
    cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('be.checked');
  }
  return cy.getAllLocalStorage().then(() => {
    expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq(
      changeToCryptoOrFiat === 'crypto' ? 'true' : 'false',
    );
  });
};
