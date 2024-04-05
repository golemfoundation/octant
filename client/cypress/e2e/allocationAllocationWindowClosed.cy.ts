import {
  connectWallet,
  visitWithLoader,
  mockCoinPricesServer,
  navigateWithCheck,
  moveEpoch,
} from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  ALLOCATION_ITEMS_KEY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

let wasTimeMoved = false;

[Object.values(viewports)[0]].forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe('move time', () => {
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
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
      visitWithLoader(ROOT_ROUTES.playground.absolute);
    });

    it('allocation window is closed, when it is not, move time', () => {
      cy.window().then(async win => {
        const isDecisionWindowOpen = win.clientReactQuery.getQueryData(
          QUERY_KEYS.isDecisionWindowOpen,
        );

        cy.log(`test 1_1 ${isDecisionWindowOpen}`);
        if (!isDecisionWindowOpen) {
          expect(true).to.be.true;
          return;
        }

        // Move time only once, for the first device.
        if (!wasTimeMoved) {
          cy.log(`test 1_2 ${isDecisionWindowOpen}`);
          cy.wrap(null).then(() => {
            return moveEpoch(win, 'decisionWindowClosed').then(() => {
              const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
                QUERY_KEYS.isDecisionWindowOpen,
              );
              wasTimeMoved = true;
              cy.log(`test 1_2 ${isDecisionWindowOpenAfter}`);
              expect(isDecisionWindowOpenAfter).to.be.false;
            });
          });
        } else {
          expect(true).to.be.true;
        }
      });
    });
  });
  // eslint-disable-next-line jest/no-disabled-tests
  describe(
    `allocation (allocation window closed): ${device}`,
    { viewportHeight, viewportWidth },
    () => {
      before(() => {
        /**
         * Global Metamask setup done by Synpress is not always done.
         * Since Synpress needs to have valid provider to fetch the data from contracts,
         * setupMetamask is required in each test suite.
         */
        cy.setupMetamask();
        cy.clock();
      });

      beforeEach(() => {
        cy.disconnectMetamaskWalletFromAllDapps();
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
        visitWithLoader(ROOT_ROUTES.projects.absolute);

        cy.get('[data-test^=ProjectItemSkeleton').should('not.exist');
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
      });

      it('AllocationItem shows all the elements', () => {
        connectWallet(true, false);
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
          .find('[data-test=AllocationItemRewards]')
          .contains(isDesktop ? 'Threshold data unavailable' : 'No threshold data');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .should('be.disabled');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText__suffix]')
          .contains('GWEI');
      });
    },
  );
});
