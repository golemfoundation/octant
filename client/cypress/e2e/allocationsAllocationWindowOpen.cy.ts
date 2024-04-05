// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  visitWithLoader,
  mockCoinPricesServer,
  navigateWithCheck,
  connectWallet,
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
import { formatUnitsBigInt } from 'src/utils/formatUnitsBigInt';

chai.use(chaiColors);

let wasTimeMoved = false;
const budget = 10000000000;
const budgetToBig = formatUnitsBigInt(BigInt(budget + 1));

[Object.values(viewports)[0]].forEach(({ device, viewportWidth, viewportHeight }) => {
  describe('', () => {
    before(() => {
      /**
       * Global Metamask setup done by Synpress is not always done.
       * Since Synpress needs to have valid provider to fetch the data from contracts,
       * setupMetamask is required in each test suite.
       */
      cy.setupMetamask();
      cy.clock();
    });
    describe('move time', () => {
      beforeEach(() => {
        cy.disconnectMetamaskWalletFromAllDapps();
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
        visitWithLoader(ROOT_ROUTES.playground.absolute);
      });

      it('allocation window is open, when it is not, move time', () => {
        cy.window().then(async win => {
          const isDecisionWindowOpen = win.clientReactQuery.getQueryData(
            QUERY_KEYS.isDecisionWindowOpen,
          );

          if (isDecisionWindowOpen) {
            expect(true).to.be.true;
            return;
          }

          // Move time only once, for the first device.
          if (!wasTimeMoved) {
            cy.wrap(null).then(() => {
              return moveEpoch(win, 'decisionWindowOpen').then(() => {
                const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
                  QUERY_KEYS.isDecisionWindowOpen,
                );
                wasTimeMoved = true;
                expect(isDecisionWindowOpenAfter).to.be.true;
              });
            });
          } else {
            expect(true).to.be.true;
          }
        });
      });

      it('playground', () => {
        cy.wait(30000);
      });
    });
    // eslint-disable-next-line jest/no-disabled-tests
    describe(
      `allocation (allocation window open): ${device}`,
      { viewportHeight, viewportWidth },
      () => {
        beforeEach(() => {
          cy.disconnectMetamaskWalletFromAllDapps();
          mockCoinPricesServer();
          localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
          localStorage.setItem(IS_ONBOARDING_DONE, 'true');
          localStorage.setItem(ALLOCATION_ITEMS_KEY, '[]');
          visitWithLoader(ROOT_ROUTES.projects.absolute);
          connectWallet(true, false);
          cy.intercept('GET', '/rewards/budget/*/epoch/*', { body: { budget } });

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
            .should('be.visible');
          cy.get('[data-test=AllocationItem]')
            .eq(0)
            .find('[data-test=AllocationItem__InputText]')
            .should('be.enabled');
        });

        it('AllocationItem__InputText correctly changes background color on focus', () => {
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

        it('AllocationItem__InputText correctly changes background color and shakes on error', () => {
          cy.get('[data-test=AllocationItem]')
            .eq(0)
            .find('[data-test=AllocationItem__InputText__suffix]')
            .contains('GWEI');
          cy.get('[data-test=AllocationItem]')
            .eq(0)
            .find('[data-test=AllocationItem__InputText]')
            .type(budgetToBig);
          cy.get('[data-test=AllocationItem]')
            .eq(0)
            .find('[data-test=AllocationItem__InputText]')
            .should('have.css', 'background-color')
            .and('be.colored', '#ff6157');
          cy.get('[data-test=AllocationItem]')
            .eq(0)
            .find('[data-test=AllocationItem__InputText]')
            .invoke('dat', 'iserror')
            .should('be.true');
        });
      },
    );
  })
});
