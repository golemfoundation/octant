import {
  connectWallet,
  visitWithLoader,
  mockCoinPricesServer,
  navigateWithCheck,
  checkProjectsViewLoaded,
} from 'cypress/utils/e2e';
import { moveTime, setupAndMoveToPlayground } from 'cypress/utils/moveTime';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  ALLOCATION_ITEMS_KEY,
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

describe('allocation (allocation window closed)', () => {
  describe('move time', () => {
    before(() => {
      /**
       * Global Metamask setup done by Synpress is not always done.
       * Since Synpress needs to have valid provider to fetch the data from contracts,
       * setupMetamask is required in each test suite.
       */
      cy.setupMetamask();
    });

    it('allocation window is closed, when it is not, move time', () => {
      setupAndMoveToPlayground();

      cy.window().then(async win => {
        moveTime(win, 'nextEpochDecisionWindowClosed').then(() => {
          cy.get('[data-test=PlaygroundView]').should('be.visible');
          const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
            QUERY_KEYS.isDecisionWindowOpen,
          );
          expect(isDecisionWindowOpenAfter).to.be.false;
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
        cy.disconnectMetamaskWalletFromAllDapps();
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
        visitWithLoader(ROOT_ROUTES.projects.absolute);

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
      });

      it('AllocationItem shows all the elements', () => {
        connectWallet({ isPatronModeEnabled: false, isTOSAccepted: true });
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
          .find('[data-test=AllocationItemRewards__value]')
          .contains('0 ETH');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItemRewardsDonors]')
          .contains('0');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText]')
          .should('be.disabled');
        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .find('[data-test=AllocationItem__InputText__suffix]')
          .contains('GWEI');
      });
    });
  });
});
