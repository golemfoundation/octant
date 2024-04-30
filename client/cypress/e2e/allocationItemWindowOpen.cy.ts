// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  visitWithLoader,
  mockCoinPricesServer,
  navigateWithCheck,
  connectWallet,
  checkProjectsViewLoaded,
} from 'cypress/utils/e2e';
import { moveTime, setupAndMoveToPlayground } from 'cypress/utils/moveTime';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  ALLOCATION_ITEMS_KEY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

const budget = '10000000000'; // 10 GWEI.

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
        localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
        visitWithLoader(ROOT_ROUTES.projects.absolute);
        connectWallet(true, false);

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
        navigateWithCheck(ROOT_ROUTES.allocation.absolute);
        cy.get('[data-test=AllocationItemSkeleton]').should('not.exist');
      });

      it('AllocationItem shows all the elements', () => {
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__name]')
          .then($allocationItemName => {
            cy.get('@projectName').then(projectName => {
              expect(projectName).to.eq($allocationItemName.text());
            });
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
          .contains('GWEI');
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
    });
  });
});
