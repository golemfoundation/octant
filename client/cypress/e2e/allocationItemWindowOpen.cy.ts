// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  visitWithLoader,
  mockCoinPricesServer,
  navigateWithCheck,
  connectWallet,
  checkProjectsViewLoaded,
  ETH_USD,
} from 'cypress/utils/e2e';
import { moveTime, setupAndMoveToPlayground } from 'cypress/utils/moveTime';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  ALLOCATION_ITEMS_KEY,
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

const budget = '10000000000000000'; // 0.01 ETH

const changeMainValueToFiat = () => {
  cy.get('[data-test=Navbar__Button--Settings]').click();
  cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').uncheck();
  cy.get('[data-test=Navbar__Button--Allocate]').click();
};

describe('allocation (allocation window open)', () => {
  describe('move time', () => {
    before(() => {
      /**
       * Global Metamask setup done by Synpress is not always done.
       * Since Synpress needs to have valid provider to fetch the data from contracts,
       * setupMetamask is required in each test suite.
       */
      cy.setupMetamask();
    });

    it('allocation window is open, when it is not, move time', () => {
      setupAndMoveToPlayground();

      cy.window().then(async win => {
        moveTime(win, 'nextEpochDecisionWindowOpen').then(() => {
          const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
            QUERY_KEYS.isDecisionWindowOpen,
          );
          expect(isDecisionWindowOpenAfter).to.be.true;
        });
      });
    });
  });

  Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
    describe(`test cases: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        /**
         * Global Metamask setup done by Synpress is not always done.
         * Since Synpress needs to have valid provider to fetch the data from contracts,
         * setupMetamask is required in each test suite.
         */
        cy.setupMetamask();
      });

      beforeEach(() => {
        cy.intercept('GET', '/rewards/budget/*/epoch/*', { body: { budget } });
        cy.disconnectMetamaskWalletFromAllDapps();
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
        visitWithLoader(ROOT_ROUTES.projects.absolute);
        connectWallet({ isPatronModeEnabled: false, isTOSAccepted: true });

        checkProjectsViewLoaded();
        cy.get('[data-test^=ProjectsView__ProjectsListItem]')
          .eq(0)
          .should('be.visible')
          .find('[data-test=ProjectsListItem__name]')
          .then($text => {
            cy.wrap($text.text()).as('projectName');
          });

        cy.get('[data-test^=ProjectsView__ProjectsListItem')
          .eq(0)
          .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
          .click();
        cy.get('[data-test^=ProjectsView__ProjectsListItem')
          .eq(1)
          .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
          .click();
        navigateWithCheck(ROOT_ROUTES.allocation.absolute);
        cy.get('[data-test=AllocationItemSkeleton]').should('not.exist');
      });

      after(() => {
        cy.disconnectMetamaskWalletFromAllDapps();
      });

      it('AllocationItem shows all the elements', () => {
        cy.get('@projectName').then(projectName => {
          cy.find('[data-test=AllocationItem__name]').contains(projectName).should('be.visible');
        });
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__imageProfile]')
          .should(isDesktop ? 'be.visible' : 'not.be.visible');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .should('be.enabled');
      });

      it('AllocationItem__InputText correctly changes background color on focus', () => {
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .focus();
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .should('have.focus');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .should('have.css', 'background-color')
          .and('be.colored', '#f1faf8');
      });

      it('AllocationItem__InputText correctly changes background color on error', () => {
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText__suffix]')
          .contains('ETH');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .type('99');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .should('have.css', 'background-color')
          .and('be.colored', '#f1faf8');
      });

      it('AllocationItem__InputText has correct suffix', () => {
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText__suffix]')
          .contains('ETH');

        changeMainValueToFiat();

        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText__suffix]')
          .contains('USD');
      });

      it(`User can change allocation item value manually (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true)`, () => {
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .clear()
          .type('0.005');
        cy.get('[data-test=AllocationItem]')
          .eq(1)
          .find('[data-test=AllocationItem__InputText]')
          .clear()
          .type('0.002');
        cy.get('[data-test=AllocationRewardsBox__section__value--0]')
          .invoke('text')
          .should('eq', '0.007 ETH');
        cy.get('[data-test=AllocationRewardsBox__section__value--1]')
          .invoke('text')
          .should('eq', '0.003 ETH');
      });

      it(`User can change allocation item value manually (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false)`, () => {
        changeMainValueToFiat();

        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .clear()
          .type(`${(0.005 * ETH_USD).toFixed(2)}`);
        cy.get('[data-test=AllocationItem]')
          .eq(1)
          .find('[data-test=AllocationItem__InputText]')
          .clear()
          .type(`${(0.002 * ETH_USD).toFixed(2)}`);
        cy.get('[data-test=AllocationRewardsBox__section__value--0]')
          .invoke('text')
          .should('eq', `$${(0.007 * ETH_USD).toFixed(2)}`);
        cy.get('[data-test=AllocationRewardsBox__section__value--1]')
          .invoke('text')
          .should('eq', `$${(0.003 * ETH_USD).toFixed(2)}`);
      });
    });
  });
});
