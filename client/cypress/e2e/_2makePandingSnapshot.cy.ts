import axios from 'axios';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { QUERY_KEYS } from 'src/api/queryKeys';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import env from 'src/env';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

// In E2E snapshotter is disabled. Before the first test can be run, pending snapshot needs to be done.
describe('Make pending snapshot', () => {
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
    visitWithLoader(ROOT_ROUTES.playground.absolute);
  });

  it('make pending snapshot', () => {
    cy.window().then(async win => {
      const isDecisionWindowOpen = win.clientReactQuery.getQueryData(
        QUERY_KEYS.isDecisionWindowOpen,
      );

      if (!isDecisionWindowOpen) {
        expect(true).to.be.true;
        return;
      }

      cy.wrap(null).then(() => {
        axios.post(`${env.serverEndpoint}snapshots/pending`).then(() => {
          cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
        });
      });
    });
  });
});
