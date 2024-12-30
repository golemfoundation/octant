// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { connectWallet, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`[AW IS OPEN] UQ: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.clearLocalStorage();
      /**
       * Global Metamask setup done by Synpress is not always done.
       * Since Synpress needs to have valid provider to fetch the data from contracts,
       * setupMetamask is required in each test suite.
       */
      cy.setupMetamask();
    });

    beforeEach(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT_ROUTES.home.absolute);
      connectWallet({ isPatronModeEnabled: false });
    });

    it('Each element of UQ tile is visible and has correct value', () => {
      cy.get('[data-test=HomeGridUQScore__Button--whatIsThis]').should('be.visible');
      cy.get('[data-test=HomeGridUQScore__Button--whatIsThis]').click();
      cy.wait(500);
      cy.get('[data-test=ModalCalculatingYourUniqueness]').should('be.visible');
      cy.get('[data-test=ModalCalculatingYourUniqueness__ProgressStepperSlim__element]').should(
        'have.length',
        3,
      );
      cy.get('[data-test=ModalCalculatingYourUniqueness__Button]').click();
      cy.wait(500);
      cy.get('[data-test=ModalCalculatingYourUniqueness]').should('not.exist');
      cy.get('[data-test=HomeGridUQScoreAddresses]').should('be.visible');
      cy.get('[data-test=HomeGridUQScore__Button--scoreTooLow]').should('be.visible');
      cy.get('[data-test=HomeGridUQScore__Button--scoreTooLow]')
        .invoke('attr', 'href')
        .should('eq', 'https://passport.gitcoin.co/#/octant/');
      cy.get('[data-test=HomeGridUQScore__Button--recalculate]').should('be.visible');
      cy.get('[data-test=HomeGridUQScore__Button--delegate]').should('be.visible');
    });
  });
});
