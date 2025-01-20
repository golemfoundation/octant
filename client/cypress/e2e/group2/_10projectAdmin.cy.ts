// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { connectWallet, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { CYPRESS_IS_PROJECT_ADMIN } from 'src/constants/window';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isLargeDesktop, isDesktop }) => {
    describe(`[AW IS OPEN] project admin: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        /**
         * Global Metamask setup done by Synpress is not always done.
         * Since Synpress needs to have valid provider to fetch the data from contracts,
         * setupMetamask is required in each test suite.
         */
        cy.setupMetamask();
      });

      beforeEach(() => {
        cy.disconnectMetamaskWalletFromAllDapps();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        visitWithLoader(ROOT_ROUTES.home.absolute);
        connectWallet({ isPatronModeEnabled: false }).then(() => {
          cy.window().then(win => {
            // eslint-disable-next-line no-param-reassign
            win[CYPRESS_IS_PROJECT_ADMIN] = true;
          });
        });
      });

      after(() => {
        cy.disconnectMetamaskWalletFromAllDapps();
      });

      it('Top bar has project admin mode style', () => {
        cy.get('[data-test=Layout__topBarWrapper]')
          .invoke('css', 'backgroundColor')
          .should('eq', 'rgba(241, 250, 248, 0.6)');
        cy.get('[data-test=LayoutTopBar__Button]')
          .then($topBar => $topBar.css('backgroundColor'))
          .should('be.colored', '#2d9b87');
        cy.get('[data-test=LayoutTopBar__Button]').should('contain.text', 'Admin');
      });

      it('User can go only to project admin mode enabled routes', () => {
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__link--home]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__link--projects]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__link--metrics]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__settingsButton]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__allocationButton]').should('not.exist');
        } else {
          cy.get('[data-test=LayoutNavbar__Button--home]').should('be.visible');
          cy.get('[data-test=LayoutNavbar__Button--projects]').should('be.visible');
          cy.get('[data-test=LayoutNavbar__Button--allocate]').should('not.exist');
          cy.get('[data-test=LayoutNavbar__Button--metrics]').should('be.visible');
          cy.get('[data-test=LayoutNavbar__Button--settings]').should('be.visible');
        }
      });

      it('User sees the right tiles in HomeView', () => {
        cy.get('[data-test=HomeRewards]').should('be.visible');
        cy.get('[data-test=HomeGridCurrentGlmLock]').should('not.exist');
        cy.get('[data-test=HomeGridPersonalAllocation]').should('be.visible');
        cy.get('[data-test=HomeGridDonations]').should('not.exist');
        cy.get('[data-test=HomeGridUQScore]').should('not.exist');
        cy.get('[data-test=HomeGridVideoBar]').should('be.visible');
        cy.get('[data-test=HomeGridTransactions]').should('be.visible');
        cy.get('[data-test=HomeGridRewardsEstimator]').should('be.visible');
        cy.get('[data-test=HomeGridEpochResults]').should('be.visible');
      });

      it('Settings view shows only project admin mode options', () => {
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__settingsButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__Button--settings]').click();
        }

        cy.wait(500);
        cy.get('[data-test=SettingsMainInfoBox]').should('not.exist');
        cy.get('[data-test=SettingsCryptoMainValueBox]').should('be.visible');
        cy.get('[data-test=SettingsCurrencyBox]').should('be.visible');
        cy.get('[data-test=SettingsShowHelpVideosBox]').should('be.visible');
        cy.get('[data-test=SettingsPatronModeBox]').should('not.exist');
        cy.get('[data-test=SettingsShowOnboardingBox]').should('not.exist');
      });
    });
  },
);
