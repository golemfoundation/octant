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
  describe(`[AW IS OPEN] Antisybil: ${device}`, { viewportHeight, viewportWidth }, () => {
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
    });

    it('Sybil user has to accept "no matching fund" rule to close the modal and not to see it anymore. Sybil user sees a badge with `Sybil account` info.', () => {
      connectWallet({ isPatronModeEnabled: false, isSybil: true });
      cy.wait(5000);

      cy.get('[data-test=ModalTimeoutListPresence]').should('be.visible');
      cy.get('[data-test=ModalTimeoutListPresence__overflow]').should('exist');
      cy.get('[data-test=ModalTimeoutListPresence__overflow]').click({ force: true });
      cy.wait(500);
      cy.get('[data-test=ModalTimeoutListPresence]').should('be.visible');
      cy.reload();
      cy.wait(1000);
      cy.get('[data-test=ModalTimeoutListPresence]').should('be.visible');
      cy.get('[data-test=ModalTimeoutListPresence__InputCheckbox]').should('not.be.checked');
      cy.get('[data-test=ModalTimeoutListPresence__Button--form]').should('not.be.disabled');
      cy.get('[data-test=ModalTimeoutListPresence__Button--form]')
        .invoke('attr', 'href')
        .should('eq', 'https://octant.fillout.com/t/wLNsbSGJKWus');
      cy.get('[data-test=ModalTimeoutListPresence__Button--close]').should('be.disabled');
      cy.get('[data-test=ModalTimeoutListPresence__InputCheckbox]').check();
      cy.get('[data-test=ModalTimeoutListPresence__InputCheckbox]').should('be.checked');
      cy.get('[data-test=ModalTimeoutListPresence__Button--close]').should('not.be.disabled');
      cy.get('[data-test=ModalTimeoutListPresence__Button--close]').click();
      cy.wait(500);
      cy.get('[data-test=ModalTimeoutListPresence]').should('not.exist');
      cy.get('[data-test=HomeGridUQScore]').scrollIntoView();
      cy.get('[data-test=HomeGridUQScoreAddresses]')
        .then($el => $el.css('backgroundColor'))
        .should('be.colored', '#fffbf2');
      cy.get('[data-test=HomeGridUQScoreAddresses__TinyLabel]').should('be.visible');
      cy.get('[data-test=HomeGridUQScoreAddresses__TinyLabel__text]')
        .then($el => $el.css('backgroundColor'))
        .should('be.colored', '#f6c54b');
      cy.get('[data-test=HomeGridUQScoreAddresses__TinyLabel__text]')
        .invoke('text')
        .should('eq', 'Sybil account');
      cy.get('[data-test=HomeGridUQScore__Button--form]').should('be.visible');
      cy.get('[data-test=HomeGridUQScore__Button--form]')
        .invoke('text')
        .should('eq', 'Want to dispute sybil status? Please use this form');
      cy.get('[data-test=HomeGridUQScore__Button--form]')
        .invoke('attr', 'href')
        .should('eq', 'https://octant.fillout.com/t/wLNsbSGJKWus');
      cy.reload();
      cy.wait(1000);
      cy.get('[data-test=ModalTimeoutListPresence]').should('not.exist');
    });
  });
});
