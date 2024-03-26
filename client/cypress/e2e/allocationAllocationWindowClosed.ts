import { visitWithLoader, mockCoinPricesServer, navigateWithCheck } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  ALLOCATION_ITEMS_KEY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
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
      });

      beforeEach(() => {
        cy.disconnectMetamaskWalletFromAllDapps();
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
        visitWithLoader(ROOT_ROUTES.projects.absolute);

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

      it('allocation window is closed', () => {
        cy.window().then(async win => {
          const isDecisionWindowOpen = win.clientReactQuery.getQueryData(
            QUERY_KEYS.isDecisionWindowOpen,
          );
          expect(isDecisionWindowOpen).to.be.false;
        });
      });

      it('AllocationItem shows all the elements', () => {
        const allocationItemFirst = cy.get('[data-test=AllocationItem]').eq(0);
        allocationItemFirst.find('[data-test=AllocationItem__name]').then($allocationItemName => {
          cy.get('@projectName').then(projectName => {
            expect(projectName).to.eq($allocationItemName.text());
          });
        });
        allocationItemFirst.find('[data-test=AllocationItem__imageProfile]').should('be.visile');
        allocationItemFirst
          .find('[data-test=AllocationItemRewards')
          .contains(isDesktop ? 'Threshold data unavailable' : 'No threshold data');
        allocationItemFirst.find('[data-test=AllocationItem__InputText]').should('be.disabled');
      });
    },
  );
});
