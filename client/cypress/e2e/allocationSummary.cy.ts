// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  visitWithLoader,
  mockCoinPricesServer,
  connectWallet,
  changeMainValueToFiat,
  ETH_USD,
} from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`allocation summary: ${device}`, { viewportHeight, viewportWidth }, () => {
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
      visitWithLoader(ROOT_ROUTES.allocation.absolute);
      cy.intercept('GET', '/rewards/budget/*/epoch/*', { body: { budget: '10000000000000000' } });
      cy.intercept('GET', '/allocations/user/*/epoch/*', {
        body: {
          allocations: [
            {
              address: '0x15c941a44a343B8c46a28F2BB9aFc7a54E255A4f',
              amount: '5000000000000000',
            },
            {
              address: '0x1c01595f9534E33d411035AE99a4317faeC4f6Fe',
              amount: '2000000000000000',
            },
          ],
          isManuallyEdited: true,
        },
      });
      connectWallet({ isPatronModeEnabled: false, isTOSAccepted: true });
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('Allocation summary section shows correct values', () => {
      cy.get('[data-test=AllocationSummary]').should('be.visible');
      cy.get('[data-test=AllocationSummary__personalRewardBox]').should('be.visible');
      cy.get('[data-test=AllocationSummaryProject]').should('have.length', 2);
      cy.get('[data-test=AllocationSummaryProject]')
        .eq(0)
        .find('[data-test=AllocationSummaryProject__donation]')
        .invoke('text')
        .should('eq', '0.005');
      cy.get('[data-test=AllocationSummaryProject]')
        .eq(1)
        .find('[data-test=AllocationSummaryProject__donation]')
        .invoke('text')
        .should('eq', '0.002');

      cy.get('[data-test=AllocationSummary__personalReward]')
        .invoke('text')
        .should('eq', '0.003 ETH');

      changeMainValueToFiat(ROOT_ROUTES.allocation.absolute);

      cy.get('[data-test=AllocationSummaryProject]')
        .eq(0)
        .find('[data-test=AllocationSummaryProject__donation]')
        .invoke('text')
        .should('eq', `$${(0.005 * ETH_USD).toFixed(2)}`);
      cy.get('[data-test=AllocationSummaryProject]')
        .eq(1)
        .find('[data-test=AllocationSummaryProject__donation]')
        .invoke('text')
        .should('eq', `$${(0.002 * ETH_USD).toFixed(2)}`);

      cy.get('[data-test=AllocationSummary__personalReward]')
        .invoke('text')
        .should('eq', `$${(0.003 * ETH_USD).toFixed(2)}`);
    });
  });
});
